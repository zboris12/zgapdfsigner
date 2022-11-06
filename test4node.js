const m_fs = require("fs");
const m_path = require("path");
const Zga = require("./lib/zganode.js");

const workpath = "test/";

async function main(){
	/** @type {string} */
	var pdfPath = m_path.join(__dirname, workpath+"_test.pdf");
	/** @type {string} */
	var pfxPath = m_path.join(__dirname, workpath+"_test.pfx");
	/** @type {string} */
	var ps = "";
	/** @type {string} */
	var imgPath = m_path.join(__dirname, workpath+"_test.png");

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
			// permission: pfx ? 2 : 0,
			signdate: "1",
			reason: "I have a test reason.",
			location: "I am on the earth.",
			contact: "zga@zga.com",
			ltv: 1,
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
		var outPath = m_path.join(__dirname, workpath+"test_signed.pdf");
		m_fs.writeFileSync(outPath, u8dat);
		console.log("Output file: " + outPath);
	}
	console.log("Done");
}

async function main2(){
	/** @type {string} */
	var pdfPath = m_path.join(__dirname, workpath+"test_signed.pdf");
	/** @type {Buffer} */
	var pdf = m_fs.readFileSync(pdfPath);
	/** @type {SignOption} */
	var sopt = {
		signdate: "2",
		reason: "I have a test reason.",
		location: "I am on the earth.",
		contact: "zga@zga.com",
		ltv: 1,
		debug: true,
	};
	/** @type {Zga.PdfSigner} */
	var ser = new Zga.PdfSigner(sopt);
	/** @type {Uint8Array} */
	var u8dat = await ser.sign(pdf);
	/** @type {string} */
	var outPath = m_path.join(__dirname, workpath+"test_signed_tsa.pdf");
	m_fs.writeFileSync(outPath, u8dat);
	console.log("Output file: " + outPath);
	return;
}

main();
// main2();
