const m_fs = require("fs");
const m_path = require("path");
const m_urlparser = require("url");
const m_h = {
	"http:": require("http"),
	"https:": require("http"),
};

globalThis.PDFLib = require("pdf-lib");
globalThis.forge = require("node-forge");
require("./zgapdfcryptor.js");
require("./zgapdfsigner.js");

/**
 * @param {string} url
 * @param {UrlFetchParams} params
 * @return {Promise<Uint8Array>}
 */
Zga.urlFetch = function(url, params){
	return new Promise(function(resolve, reject){
		/** @type {URL} */
		var opts = m_urlparser.parse(url);
		var http = m_h[opts.protocol];
		/** @type {string|Buffer} */
		var dat = null;
		var encoding = undefined;
		if(params.payload instanceof Buffer){
			dat = params.payload;
		}else if(params.payload instanceof Uint8Array){
			dat = Buffer.from(params.payload.buffer);
		}else if(params.payload instanceof ArrayBuffer){
			dat = Buffer.from(params.payload);
		}else{
			dat = params.payload;
			encoding = "binary";
		}

		if(params.headers){
			opts.headers = params.headers;
		}
		if(params.method){
			opts.method = params.method;
		}
		if(params.validateHttpsCertificates === false){
			opts.rejectUnauthorized = false;
		}

		/** @type {http.ClientRequest} */
		var hreq = http.request(opts, function(/** @type {http.IncomingMessage} */a_res){
			if(a_res.statusCode !== 200){
				var a_err = new Error("Failed to request url. " + url +  "\n Status Code: " + a_res.statusCode);
				a_res.resume();
				throw a_err;
			}
			/** @type {Array<Buffer>} */
			var a_bufs = [];
			var a_bufs_len = 0;
			a_res.on("data", function(/** @type {Buffer} */b_chunk){
				a_bufs.push(b_chunk);
				a_bufs_len += b_chunk.length;
			});
			a_res.on("end", function(){
				/** @type {Buffer} */
				var b_bdat = Buffer.concat(a_bufs, a_bufs_len);
				resolve(b_bdat);
			});
		});
		hreq.on("error", function(a_err){
			throw a_err;
		});
		hreq.end(dat, encoding);
	});
};

async function main(){
	/** @type {string} */
	var pdfPath = m_path.join(__dirname, "test/_test.pdf");
	/** @type {string} */
	var pfxPath = m_path.join(__dirname, "test/_test.pfx");
	/** @type {string} */
	var ps = "";
	/** @type {string} */
	var imgPath = m_path.join(__dirname, "test/_test.png");

	if(process.argv.length > 3){
		pfxPath = process.argv[2];
		ps = process.argv[3];
	}else if(process.argv[2]){
		ps = process.argv[2];
	}

	if(!ps){
		// throw new Error("The passphrase is not specified.");
		pfxPath = "";
	}

	/** @type {Buffer} */
	var pdf = m_fs.readFileSync(pdfPath);
	/** @type {Buffer} */
	var pfx = null;
	if(pfxPath){
		pfx = m_fs.readFileSync(pfxPath);
	}
	/** @type {Buffer} */
	var img = null;
	/** @type {string} */
	var imgType = "";
	if(imgPath){
		img = m_fs.readFileSync(imgPath);
		imgType = m_path.extname(imgPath).slice(1);
	}

	/** @type {SignOption} */
	var sopt = null;
	if(pdf){
		sopt = {
			p12cert: pfx,
			pwd: ps,
			permission: pfx ? 1 : 0,
			signdate: "1",
			reason: "I have a test reason.",
			location: "I am on the earth.",
			contact: "zga@zga.com",
			debug: true,
		};
		if(img){
			sopt.drawinf = {
				area: {
					x: 25, // left
					y: 150, // top
					w: 60,
					h: 60,
				},
//				pageidx: 2,
				imgData: img,
				imgType: imgType,
			};
		}
	}

	/** @type {EncryptOption} */
	var eopt = undefined;
	eopt = {
		mode: Zga.Crypto.Mode.AES_256,
		permissions: ["copy", "copy-extract", "print-high"],
		userpwd: "123",
	};
	// eopt.pubkeys = [];

	/** @type {Uint8Array} */
	var u8dat = null;
	if(sopt){
		/** @type {Zga.PdfSigner} */
		var ser = new Zga.PdfSigner(sopt);
		u8dat = await ser.sign(pdf, eopt);
	}

	if(u8dat){
		/** @type {string} */
		var outPath = m_path.join(__dirname, "test/test_test2.pdf");
		m_fs.writeFileSync(outPath, u8dat);
		console.log("Output file: " + outPath);
	}
	console.log("Done");
}

main();
