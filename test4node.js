// ES Module Mode
// import * as m_fs from "node:fs";
// import * as m_path from "node:path";
// import { fileURLToPath } from "node:url";
// import { default as Zga } from "./lib/zganode.js";
// const __dirname = m_path.dirname(fileURLToPath(import.meta.url));

const m_fs = require("fs");
const m_path = require("path");
const Zga = require("./lib/zganode.js");

const workpath = "test/";

/**
 * @param {string} pdfPath
 * @param {string} pfxPath
 * @param {string} ps
 * @param {number} perm
 * @param {string=} imgPath
 * @param {string=} txt
 * @param {string=} fontPath
 * @return {Promise<string>} output path
 */
async function sign_protect(pdfPath, pfxPath, ps, perm, imgPath, txt, fontPath){
	/** @type {Buffer} */
	var pdf = m_fs.readFileSync(pdfPath);
	/** @type {Buffer} */
	var pfx = m_fs.readFileSync(pfxPath);
	/** @type {Buffer} */
	var img = null;
	/** @type {string} */
	var imgType = "";
	/** @type {Buffer|string} */
	var font = null;

	if(perm == 1){
		console.log("\nTest signing pdf with full protection. (permission 1 and password encryption)");
	}else{
		console.log("\nTest signing pdf with permission "+perm);
	}

	if(imgPath){
		img = m_fs.readFileSync(imgPath);
		imgType = m_path.extname(imgPath).slice(1);
	}
	if(fontPath){
		if(Zga.PDFLib.isStandardFont(fontPath)){
			font = fontPath;
		}else{
			font = m_fs.readFileSync(fontPath);
		}
	}
	/** @type {SignOption} */
	var sopt = {
		p12cert: pfx,
		pwd: ps,
		permission: perm,
		signdate: "1",
		reason: "I have a test reason "+perm+".",
		location: "I am on the earth "+perm+".",
		contact: "zga"+perm+"@zga.com",
		ltv: 1,
		debug: true,
	};
	if(img || txt){
		sopt.drawinf = {
			area: {
				x: perm ? 25 : 200, // left
				y: 50, // top
				w: txt ? undefined : 60,
				h: txt ? undefined : 100,
			},
			pageidx: "-",
			imgInfo: img ? {
				imgData: img,
				imgType: imgType,
			} : undefined,
			textInfo: txt ? {
				text: txt,
				fontData: font,
				color: "00f0f1",
				lineHeight: 20,
				size: 16,
				align: 1,
				wMax: 80,
				yOffset: 10,
				xOffset: 20,
				noBreaks: "[あいうえおA-Za-z0-9]",
			} : undefined,
		};
	}

	/** @type {EncryptOption} */
	var eopt = undefined;
	if(perm == 1){
		eopt = {
			mode: Zga.Crypto.Mode.AES_256,
			permissions: ["copy", "copy-extract", "print-high"],
			userpwd: "123",
		};
	}

	/** @type {Zga.PdfSigner} */
	var ser = new Zga.PdfSigner(sopt);
	/** @type {Uint8Array} */
	var u8dat = await ser.sign(pdf, eopt);
	if(u8dat){
		/** @type {string} */
		var outPath = m_path.join(__dirname, workpath+"test_perm"+perm+m_path.basename(pdfPath));
		m_fs.writeFileSync(outPath, u8dat);
		console.log("Output file: " + outPath);
	}
	return outPath;
}

/**
 * @param {string} pdfPath
 * @return {Promise<string>} output path
 */
async function addtsa(pdfPath){
	console.log("\nTest signing pdf by a timestamp.");

	/** @type {Buffer} */
	var pdf = m_fs.readFileSync(pdfPath);
	/** @type {SignOption} */
	var sopt = {
		signdate: "2",
		reason: "I have a test reason tsa.",
		location: "I am on the earth tsa.",
		contact: "zgatsa@zga.com",
		ltv: 1,
		debug: true,
	};
	/** @type {Zga.PdfSigner} */
	var ser = new Zga.PdfSigner(sopt);
	/** @type {Uint8Array} */
	var u8dat = await ser.sign(pdf);
	/** @type {string} */
	var outPath = m_path.join(__dirname, workpath+"tsa_"+m_path.basename(pdfPath));
	m_fs.writeFileSync(outPath, u8dat);
	console.log("Output file: " + outPath);
	return outPath;
}

/**
 * @param {number} angle
 */
async function main1(angle){
	/** @type {string} */
	var pdfPath = m_path.join(__dirname, workpath+"_test"+(angle ? "_"+angle : "")+".pdf");
	/** @type {string} */
	var pfxPath = m_path.join(__dirname, workpath+"_test.pfx");
	/** @type {string} */
	var ps = "";
	/** @type {string} */
	var imgPath = m_path.join(__dirname, workpath+"_test.png");
	/** @type {string} */
	var fontPath = m_path.join(__dirname, workpath+"_test.ttf");
	// var fontPath = Zga.PDFLib.StandardFonts.CourierBold;

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

	if(pfxPath){
		await sign_protect(pdfPath, pfxPath, ps, 1, imgPath, "あいうえおあいうえおか\r\n\nThis is a test of text!\n");
		if(Zga.PDFLib.isStandardFont(fontPath)){
			pdfPath = await sign_protect(pdfPath, pfxPath, ps, 2, imgPath, "This is an another test of text!\n", fontPath);
			pdfPath = await sign_protect(pdfPath, pfxPath, ps, 0, undefined, "This is a test for same font!\n", fontPath);
		}else{
			pdfPath = await sign_protect(pdfPath, pfxPath, ps, 2, imgPath, "ありがとうご\r\nThis is an another test of text!\n", fontPath);
			pdfPath = await sign_protect(pdfPath, pfxPath, ps, 0, undefined, "たちつてと\n\nThis is a test for same font!\n", fontPath);
		}
		await addtsa(pdfPath);
	}else{
		await addtsa(pdfPath);
	}

	console.log("Done");
}

// test urlFetch
async function main2(){
	/** @type {Uint8Array} */
	var u8arr = await Zga.urlFetch("http://localhost:8080", {
		"headers": {
			"testzb": "pineapple"
		}
	});
	// /** @type {string} */
	// var str = btoa(Zga.u8arrToRaw(u8arr));
	/** @type {TextDecoder} */
	var txtdec = new TextDecoder("utf-8");
	/** @type {string} */
	var str = txtdec.decode(u8arr);
	console.log(str);
}

function webserver(){
	require("http").createServer(function(req, res){
		if(req.method == "GET"){
			if(req.headers["testzb"]){
				res.setHeader("Access-Control-Allow-Origin", "*");
				if(req.url == "/"){
					console.log(req.headers["testzb"]);
					res.writeHead(302, {"Location": "/testzb"});
					res.end();
				}else if(req.url == "/testzb"){
					res.writeHead(200, {"Content-Type": "text/plain"});
					res.end("I am redirected!\n");
				}else{
					res.statusCode = 500;
					res.statusMessage = "Bad Request.";
					res.end();
				}
			}else{
				res.writeHead(200, {"Content-Type": "text/plain"});
				res.end("Hello World\n");
			}
		}else if(req.method == "OPTIONS"){
			res.setHeader("Access-Control-Allow-Origin", "*");
			res.setHeader("Access-Control-Allow-Method", "GET, OPTIONS, HEAD");
			res.setHeader("Access-Control-Allow-Headers", "Accept, Accept-Language, Content-Language, Content-Type, Range, testzb");
			res.statusCode = 200;
			res.statusMessage = "CORS OK";
			res.end();
		}
	}).listen(8080, function(){console.log("Server http://localhost:8080")});
}

async function main(){
	/** @type {Array<number>} */
	var arr = [0, 90, 180, 270];
	/** @type {number} */
	for(var i=0; i<arr.length; i++){
		await main1(arr[i]);
		// break;
	}
}

if(process.argv[2] == "webserver"){
	webserver();
}else if(process.argv[2] == "fetch"){
	main2();
}else{
	main();
}
