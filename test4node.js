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
	/** @type {Buffer} */
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
		font = m_fs.readFileSync(fontPath);
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
				x: 25, // left
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
		await sign_protect(pdfPath, pfxPath, ps, 1, imgPath, "あいうえおあいうえおか\r\n\nThis is a test of text!\n", fontPath);
		pdfPath = await sign_protect(pdfPath, pfxPath, ps, 2, undefined, "ありがとうご\r\n\nThis is an another test of text!\n", fontPath);
		await addtsa(pdfPath);
	}else{
		await addtsa(pdfPath);
	}

	console.log("Done");
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

main();
