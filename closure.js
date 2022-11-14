const m_fs = require("fs");
const m_path = require("path");
const m_cp = require("child_process");

/** @const {string} */
const m_libpath = "lib/";
/** @const {string} */
const m_distpath = "dist/_";
/** @const {Array<string>} */
const m_targets = ["zgacertsutil.js", "zgapdfcryptor.js", "zgapdfsigner.js", "zgaindex.js"];
/** @const {Array<string>} */
const m_dists = [];

/**
 * @param {string} raw
 * @return {Uint8Array}
 */
function rawToU8arr(raw){
	/** @type {Uint8Array} */
	var arr = new Uint8Array(raw.length);
	for(var i=0; i<raw.length; i++){
		arr[i] = raw.charCodeAt(i);
	}
	return arr;
}
/** @const {number} */
const m_repcode = "*".charCodeAt(0);
/** @const {Uint8Array} */
const m_cprbufst = rawToU8arr("//Only for nodejs Start");
/** @const {number} */
const m_repidxst = 1;
/** @const {Uint8Array} */
const m_cprbufed = rawToU8arr("Only for nodejs End//");
/** @const {number} */
const m_repidxed = 19;

/** @type {boolean} */
var m_debug = false;

/**
 * @param {Uint8Array} tgtbuf
 * @param {number} idx
 * @param {Uint8Array} cprbuf
 * @return {boolean}
 */
function sameBuffer(tgtbuf, idx, cprbuf){
	for(var i=0; i<cprbuf.length; i++,idx++){
		if(idx >= tgtbuf.length){
			return false;
		}else if(tgtbuf[idx] != cprbuf[i]){
			return false;
		}
	}
	return true;
}

/**
 * @param {string} js
 */
function fixjs(js){
	/** @type {string} */
	var jspath = m_path.join(__dirname, m_libpath + js);
	/** @type {Buffer} */
	var jsbuf = m_fs.readFileSync(jspath);
	for(var i=0; i<jsbuf.length; i++){
		if(sameBuffer(jsbuf, i, m_cprbufst)){
			jsbuf[i + m_repidxst] = m_repcode;
		}else if(sameBuffer(jsbuf, i, m_cprbufed)){
			jsbuf[i + m_repidxed] = m_repcode;
		}
	}

	jspath = m_distpath + js;
	m_dists.push(jspath);

	jspath = m_path.join(__dirname, jspath);
	m_fs.writeFileSync(jspath, jsbuf);
	if(m_debug){
		console.log("Output file: " + jspath);
	}
}
/**
 * @param {string} js
 */
function deltmpjs(js){
	/** @type {string} */
	var jspath = m_path.join(__dirname, js);
	m_fs.rmSync(jspath);
	if(m_debug){
		console.log("Deleted file: " + jspath);
	}
}

/**
 * @param {envfil}
 * @return {Object<string, string>}
 */
function loadEnv(envfil){
	/** @type {Object<string, string>} */
	var retobj = {};
	/** @type {string} */
	var envpath = m_path.join(__dirname, envfil);
	/** @type {Array<string>} */
	var envs = m_fs.readFileSync(envpath, "utf8").split("\n");
	envs.forEach(function(/** @type {string} */a_env){
		a_env = a_env.trimStart();
		if(a_env.charAt(0) != "#"){
			var a_idx = a_env.indexOf("=");
			if(a_idx > 0){
				retobj[a_env.substring(0, a_idx)] = a_env.substring(a_idx + 1);
			}
		}
	});
	if(m_debug){
		console.log("Environment:");
		console.log(retobj);
	}
	return retobj;
}

function main(){
	if(process.argv.indexOf("-debug") > 0){
		m_debug = true;
	}

	/** @type {Object<string, string>} */
	var env = loadEnv(".env");

	/** @type {boolean} */
	var flg = true;
	if(!env.java){
		console.error("Can't find java's execution path in .env file.");
		flg = false;
	}
	if(!env.closure){
		console.error("Can't find closure complier's path in .env file.");
		flg = false;
	}
	if(!flg){
		return;
	}

	m_targets.forEach(fixjs);

	/** @type {Array<string>} */
	var cmd = [env.java];
	cmd.push("-jar " + env.closure);
	cmd.push("--charset UTF-8");
	cmd.push("--compilation_level SIMPLE_OPTIMIZATIONS");
	cmd.push("--warning_level VERBOSE");
	cmd.push("--externs closure/google-ext.js");
	cmd.push("--externs closure/forge-ext.js");
	cmd.push("--externs closure/pdflib-ext.js");
	cmd.push("--externs closure/zb-externs.js");
	m_dists.forEach(function(a_js){
		cmd.push("--js " + a_js);
	});
	cmd.push("--js_output_file dist/zgapdfsigner.min.js");
	if(m_debug){
		console.log(cmd.join(" "));
	}

	console.log("Excuting google closure compiler...\n");
	m_cp.exec(cmd.join(" "), function(a_err, a_stdout, a_stderr){
		const a_rex = new RegExp("^" + m_distpath, "g");
		// if(a_err){
			// console.log(a_err);
		// }
		if(a_stdout){
			console.log(a_stdout.replaceAll(a_rex, m_libpath));
		}
		if(a_stderr){
			console.log(a_stderr.replaceAll(a_rex, m_libpath));
		}
		m_dists.forEach(deltmpjs);
		console.log("Done");
	});
}

main();
