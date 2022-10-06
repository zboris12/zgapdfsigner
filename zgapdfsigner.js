'use strict';

/**
 * @param {Object<string, *>} z
 */
function supplyZgaSigner(z){

/** @type {Object<string, TsaServiceInfo>} */
z.TSAURLS = {
	"1": {url: "http://ts.ssl.com", len: 15600},
	"2": {url: "http://timestamp.digicert.com", len: 15400},
	"3": {url: "http://timestamp.sectigo.com", len: 13400},
	"4": {url: "http://timestamp.entrust.net/TSS/RFC3161sha2TS", len: 14400},
	"5": {url: "http://timestamp.apple.com/ts01", len: 12100},
	"6": {url: "http://www.langedge.jp/tsa", len: 9200},
	"7": {url: "https://freetsa.org/tsr", len: 14500},
};

z.PdfSigner = class{
	/**
	 * @param {SignOption} signopt
	 */
	constructor(signopt){
		/** @private @const {string} */
		this.DEFAULT_BYTE_RANGE_PLACEHOLDER = "**********";
		/** @private @type {SignOption} */
		this.opt = signopt;
		/** @type {forge_key} */
		this.privateKey = null;
		/** @type {Array<forge_cert>} */
		this.certs = [];
		/** @type {number} */
		this.certIdx = 0;
		/** @private @type {?TsaServiceInfo} */
		this.tsainf = null;
		/** @private @type {number} */
		this.siglen = 0;
		/** @private @type {PDFLib.PDFHexString} */
		this.sigContents = null;
		/** @private @type {boolean} */
		this.debug = false;

		if(!globalThis.PDFLib){
			throw new Error("pdf-lib is not imported.");
		}
		if(!globalThis.forge){
			throw new Error("node-forge is not imported.");
		}
		if(signopt.signdate){
			if(typeof signopt.signdate == "string"){
				this.tsainf = {
					url: signopt.signdate,
				};
			}else if(signopt.signdate.url){
				this.tsainf = /** @type {TsaServiceInfo} */(Object.assign({}, signopt.signdate));
			}
		}
		if(this.tsainf){
			if(!globalThis.UrlFetchApp){
				throw new Error("Because of the CORS security restrictions, signing with TSA is not supported in web browser.");
			}
			if(z.TSAURLS[this.tsainf.url]){
				Object.assign(this.tsainf, z.TSAURLS[this.tsainf.url]);
			}else if(!(new RegExp("^https?://")).test(this.tsainf.url)){
				throw new Error("Unknown tsa data. " + JSON.stringify(this.tsainf));
			}
			if(!this.tsainf.len){
				this.tsainf.len = 16000;
			}
		}
		if(typeof this.opt.debug == "boolean"){
			this.debug = this.opt.debug;
		}else if(globalThis.debug){
			this.debug = true;
		}
	}

	/**
	 * @public
	 * @param {PDFLib.PDFDocument|Array<number>|Uint8Array|ArrayBuffer|string} pdf
	 * @param {EncryptOption=} cypopt
	 * @return {Promise<Uint8Array>}
	 */
	async sign(pdf, cypopt){
		if(cypopt && !z.PdfCryptor){
			throw new Error("ZgaPdfCryptor is not imported.");
		}

		/** @type {PDFLib.PDFDocument} */
		var pdfdoc = await z.loadPdf(pdf);

		if(this.opt.drawinf && this.opt.drawinf.imgData && !this.opt.drawinf.img){
			/** @type {Uint8Array|ArrayBuffer|string} */
			var imgData2 = null;
			if(Array.isArray(this.opt.drawinf.imgData)){
				imgData2 = new Uint8Array(this.opt.drawinf.imgData);
			}else{
				imgData2 = this.opt.drawinf.imgData;
			}
			if(this.opt.drawinf.imgType == "png"){
				this.opt.drawinf.img = await pdfdoc.embedPng(imgData2);
			}else if(this.opt.drawinf.imgType == "jpg"){
				this.opt.drawinf.img = await pdfdoc.embedJpg(imgData2);
			}else{
				throw new Error("Unkown image type. " + this.opt.drawinf.imgType);
			}
		}

		this.addSignHolder(pdfdoc);
		this.log("A signature holder has been added to the pdf.");

		/** @type {forge_cert} */
		var cert = this.loadP12cert(this.opt.p12cert, this.opt.pwd);
		if(cert){
			z.fixCertAttributes(cert);
		}

		if(cypopt){
			if(cypopt.pubkeys){
				if(cypopt.pubkeys.length == 0){
					cypopt.pubkeys.push({
						c: cert,
					});
				}else{
					cypopt.pubkeys.forEach(function(/** @type {PubKeyInfo} */a_pubkey){
						// If there is no c in the PubKeyInfo, set cert to it.
						if(!a_pubkey.c){
							a_pubkey.c = cert;
						}
					});
				}
			}
			/** @type {Zga.PdfCryptor} */
			var cypt = new z.PdfCryptor(cypopt);
			pdfdoc = await cypt.encryptPdf(pdfdoc, true);
			// Because pdfdoc has been changed, so this.sigContents need to be found again.
			this.sigContents = null;
			this.log("Pdf data has been encrypted.");
		}

		/** @type {Uint8Array} */
		var ret = await this.saveAndSign(pdfdoc);
		if(!ret){
			this.log("Change size of signature's placeholder and retry.");
			if(!this.sigContents){
				this.sigContents = this.findSigContents(pdfdoc);
			}
			this.sigContents.value = "0".repeat(this.siglen);
			ret = await this.saveAndSign(pdfdoc);
		}
		if(ret){
			this.log("Signing pdf accomplished.");
		}else{
			throw new Error("Failed to sign the pdf.");
		}

		return ret;
	}

	/**
	 * @private
	 * @param {PDFLib.PDFDocument} pdfdoc
	 * @return {Promise<Uint8Array>}
	 */
	async saveAndSign(pdfdoc){
		/** @type {Uint8Array} */
		var uarr = await pdfdoc.save({"useObjectStreams": false});
		/** @type {string} */
		var pdfstr = z.u8arrToRaw(uarr);
		return this.signPdf(pdfstr);
	}

	/**
	 * @private
	 * @param {PDFLib.PDFDocument} pdfdoc
	 */
	addSignHolder(pdfdoc){
		/** @const {z.VisualSignature} */
		const visign = new z.VisualSignature(this.opt.drawinf);
		/** @const {PDFLib.PDFRef} */
		const strmRef = visign.createStream(pdfdoc, this.opt.signame);
		/** @const {PDFLib.PDFPage} */
		const page = pdfdoc.getPages()[visign.getPageIndex()];

		/** @type {Date} */
		var signdate = new Date();
		if(this.opt.signdate instanceof Date && !this.tsainf){
			signdate = this.opt.signdate;
		}

		/** @type {PDFLib.PDFArray} */
		var bytrng = new PDFLib.PDFArray(pdfdoc.context);
		bytrng.push(PDFLib.PDFNumber.of(0));
		bytrng.push(PDFLib.PDFName.of(this.DEFAULT_BYTE_RANGE_PLACEHOLDER));
		bytrng.push(PDFLib.PDFName.of(this.DEFAULT_BYTE_RANGE_PLACEHOLDER));
		bytrng.push(PDFLib.PDFName.of(this.DEFAULT_BYTE_RANGE_PLACEHOLDER));

		this.siglen = /** @type {number} */(this.tsainf ? this.tsainf.len : 3322);
		this.sigContents = PDFLib.PDFHexString.of("0".repeat(this.siglen));

		/** @type {Object<string, *>} */
		var signObj = {
			"Type": "Sig",
			"Filter": "Adobe.PPKLite",
			"SubFilter": "adbe.pkcs7.detached",
			"ByteRange": bytrng,
			"Contents": this.sigContents,
			"M": PDFLib.PDFString.fromDate(signdate),
			"Prop_Build": pdfdoc.context.obj({
				"App": pdfdoc.context.obj({
					"Name": "ZgaPdfSinger",
				}),
			}),
		};
		if(this.opt.reason){
			signObj["Reason"] = this.convToPDFString(this.opt.reason);
		}
		if(this.opt.location){
			signObj["Location"] = this.convToPDFString(this.opt.location);
		}
		if(this.opt.contact){
			signObj["ContactInfo"] = this.convToPDFString(this.opt.contact);
		}
		var signatureDictRef = pdfdoc.context.register(pdfdoc.context.obj(signObj));

		/** @type {Object<string, *>} */
		var widgetObj = {
			"Type": "Annot",
			"Subtype": "Widget",
			"FT": "Sig",
			"Rect": visign.getSignRect(),
			"V": signatureDictRef,
			"T": this.convToPDFString(this.opt.signame ? this.opt.signame : "Signature1"),
			"F": 132,
			"P": page.ref,
		};
		if(strmRef){
			widgetObj["AP"] = pdfdoc.context.obj({
				"N": strmRef,
			});
		}
		var widgetDictRef = pdfdoc.context.register(pdfdoc.context.obj(widgetObj));

		// Add our signature widget to the page
		page.node.set(PDFLib.PDFName.of("Annots"), pdfdoc.context.obj([widgetDictRef]));

		// Create an AcroForm object containing our signature widget
		pdfdoc.catalog.set(
			PDFLib.PDFName.of("AcroForm"),
			pdfdoc.context.obj({
				"SigFlags": 3,
				"Fields": [widgetDictRef],
			}),
		);
	}

	/**
	 * @private
	 * @param {PDFLib.PDFDocument} pdfdoc
	 * @return {PDFLib.PDFHexString}
	 */
	findSigContents(pdfdoc){
		/** @type {boolean} */
		var istgt = false;
		/** @type {PDFLib.PDFHexString} */
		var sigContents = null;
		/** @type {Array<PdfObjEntry>} */
		var objarr = pdfdoc.context.enumerateIndirectObjects();
		for(var i=objarr.length - 1; i>= 0; i--){
			if(objarr[i][1].dict instanceof Map){
				/** @type {Iterator<PdfObjEntry>} */
				var es = objarr[i][1].dict.entries();
				/** @type {IIterableResult<PdfObjEntry>} */
				var res = es.next();
				istgt = false;
				sigContents = null;
				while(!res.done){
					if(res.value[0].encodedName == "/ByteRange"){
						if(res.value[1].array &&
							res.value[1].array.length == 4 &&
							res.value[1].array[0].numberValue == 0 &&
							res.value[1].array[1].encodedName == "/" + this.DEFAULT_BYTE_RANGE_PLACEHOLDER &&
							res.value[1].array[2].encodedName == res.value[1].array[1].encodedName &&
							res.value[1].array[3].encodedName == res.value[1].array[1].encodedName){
							istgt = true;
						}
					}else if(res.value[0].encodedName == "/Contents"){
						if(res.value[1] instanceof PDFLib.PDFHexString){
							sigContents = res.value[1];
						}
					}
					if(istgt && sigContents){
						return sigContents;
					}else{
						res = es.next();
					}
				}
			}
		}
		return null;
	}


	/**
	 * @private
	 * @param {Array<number>|Uint8Array|ArrayBuffer|string} p12cert
	 * @param {string} pwd
	 * @return {forge_cert}
	 */
	loadP12cert(p12cert, pwd){
		// load P12 certificate
		if(typeof p12cert !== "string"){
			p12cert = z.u8arrToRaw(new Uint8Array(p12cert));
		}
		// Convert Buffer P12 to a forge implementation.
		/** @type {forge.asn1} */
		var p12Asn1 = forge.asn1.fromDer(p12cert);
		/** @type {forge.pkcs12} */
		var p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, true, pwd);
		// Extract safe bags by type.
		// We will need all the certificates and the private key.
		/** @type {Object<string|number, P12Bag>} */
		var certBags = p12.getBags({
			"bagType": forge.pki.oids.certBag,
		})[forge.pki.oids.certBag];
		/** @type {Object<string|number, P12Bag>} */
		var keyBags = p12.getBags({
			"bagType": forge.pki.oids.pkcs8ShroudedKeyBag,
		})[forge.pki.oids.pkcs8ShroudedKeyBag];
		this.privateKey = keyBags[0].key;
		if(certBags){
			// Get all the certificates (-cacerts & -clcerts)
			// Keep track of the last found client certificate.
			// This will be the public key that will be bundled in the signature.
			Object.keys(certBags).forEach(function(a_ele){
				/** @type {forge_cert} */
				var a_cert = certBags[a_ele].cert;

				this.certs.push(a_cert);

				// Try to find the certificate that matches the private key.
				if(this.privateKey.n.compareTo(a_cert.publicKey.n) === 0
				&& this.privateKey.e.compareTo(a_cert.publicKey.e) === 0){
					this.certIdx = this.certs.length;
				}
			}.bind(this));
		}
		if(this.certIdx > 0){
			return this.certs[--this.certIdx];
			// z.fixCertAttributes(this.certs[this.certIdx]);
		}else{
			throw new Error("Failed to find a certificate.");
		}
	}

	/**
	 * @private
	 * @param {string} pdfstr
	 * @return {Uint8Array}
	 */
	signPdf(pdfstr){
		/** @type {Date} */
		var signdate = new Date();
		if(this.opt.signdate instanceof Date && !this.tsainf){
			signdate = this.opt.signdate;
		}

		// Finds ByteRange information within a given PDF Buffer if one exists
		/** @type {Array<string>} */
		var byteRangeStrings = pdfstr.match(/\/ByteRange\s*\[{1}\s*(?:(?:\d*|\/\*{10})\s+){3}(?:\d+|\/\*{10}){1}\s*]{1}/g);
		/** @type {string|undefined} */
		var byteRangePlaceholder = byteRangeStrings.find(function(a_str){
			return a_str.includes("/"+this.DEFAULT_BYTE_RANGE_PLACEHOLDER);
		}.bind(this));
		if(!byteRangePlaceholder){
			throw new Error("no signature placeholder");
		}
		/** @type {number} */
		var byteRangePos = pdfstr.indexOf(byteRangePlaceholder);
		/** @type {number} */
		var byteRangeEnd = byteRangePos + byteRangePlaceholder.length;
		/** @type {number} */
		var contentsTagPos = pdfstr.indexOf('/Contents ', byteRangeEnd);
		/** @type {number} */
		var placeholderPos = pdfstr.indexOf('<', contentsTagPos);
		/** @type {number} */
		var placeholderEnd = pdfstr.indexOf('>', placeholderPos);
		/** @type {number} */
		var placeholderLengthWithBrackets = placeholderEnd + 1 - placeholderPos;
		/** @type {number} */
		var placeholderLength = placeholderLengthWithBrackets - 2;
		/** @type {Array<number>} */
		var byteRange = [0, 0, 0, 0];
		byteRange[1] = placeholderPos;
		byteRange[2] = byteRange[1] + placeholderLengthWithBrackets;
		byteRange[3] = pdfstr.length - byteRange[2];
		/** @type {string} */
		var actualByteRange = "/ByteRange [" + byteRange.join(" ") +"]";
		actualByteRange += ' '.repeat(byteRangePlaceholder.length - actualByteRange.length);
		// Replace the /ByteRange placeholder with the actual ByteRange
		pdfstr = pdfstr.slice(0, byteRangePos) + actualByteRange + pdfstr.slice(byteRangeEnd);
		// Remove the placeholder signature
		pdfstr = pdfstr.slice(0, byteRange[1]) + pdfstr.slice(byteRange[2], byteRange[2] + byteRange[3]);

		// Here comes the actual PKCS#7 signing.
		/** @type {forge.pkcs7} */
		var p7 = forge.pkcs7.createSignedData();
		// Start off by setting the content.
		p7.content = forge.util.createBuffer(pdfstr);

		// Add all the certificates (-cacerts & -clcerts) to p7
		this.certs.forEach(function(a_cert){
			p7.addCertificate(a_cert);
		});

		// Add a sha256 signer. That's what Adobe.PPKLite adbe.pkcs7.detached expects.
		p7.addSigner({
			key: this.privateKey,
			certificate: this.certs[this.certIdx],
			digestAlgorithm: forge.pki.oids.sha256,
			authenticatedAttributes: [
				{
					"type": forge.pki.oids.contentType,
					"value": forge.pki.oids.data,
				}, {
					"type": forge.pki.oids.messageDigest,
				}, {
					"type": forge.pki.oids.signingTime,
					"value": signdate,
				},
			],
		});

		if(this.tsainf){
			//p7.signers[0].unauthenticatedAttributes.push({type: forge.pki.oids.timeStampToken, value: ""}) 
			p7.signers[0].unauthenticatedAttributes.push({type: "1.2.840.113549.1.9.16.2.14", value: ""});
		}

		// Sign in detached mode.
		p7.sign({"detached": true});

		if(this.tsainf){
			/** @type {forge.asn1} */
			var tsatoken = this.queryTsa(p7.signers[0].signature);
			p7.signerInfos[0].value[6].value[0].value[1] = forge.asn1.create(
				forge.asn1.Class.UNIVERSAL,
				forge.asn1.Type.SET,
				true,
				[tsatoken]
			);
			this.log("Timestamp from " + this.tsainf.url + " has been added to the signature.");
		}

		// Check if the PDF has a good enough placeholder to fit the signature.
		/** @type {string} */
		var sighex = forge.asn1.toDer(p7.toAsn1()).toHex();
		// placeholderLength represents the length of the HEXified symbols but we're
		// checking the actual lengths.
		this.log("Size of signature is " + sighex.length + "/" + placeholderLength);
		if(sighex.length > placeholderLength){
			// throw new Error("Signature is too big. Needs: " + sighex.length);
			this.siglen = sighex.length;
			return null;
		}else{
			// Pad the signature with zeroes so the it is the same length as the placeholder
			sighex += "0".repeat(placeholderLength - sighex.length);
		}
		// Place it in the document.
		pdfstr = pdfstr.slice(0, byteRange[1]) + "<" + sighex + ">" + pdfstr.slice(byteRange[1]);

		return z.rawToU8arr(pdfstr);
	}

	/**
	 * @private
	 * @param {string} str
	 * @return {PDFLib.PDFString|PDFLib.PDFHexString}
	 */
	convToPDFString(str){
		// Check if there is a multi-bytes char in the string.
		/** @type {boolean} */
		var flg = false;
		for(var i=0; i<str.length; i++){
			if(str.charCodeAt(i) > 0xFF){
				flg = true;
				break;
			}
		}
		if(flg){
			return PDFLib.PDFHexString.fromText(str);
		}else{
			return PDFLib.PDFString.of(str);
		}
	}

	/**
	 * @private
	 * @param {string=} signature
	 * @return {string}
	 */
	genTsrData(signature){
		// Generate SHA256 hash from signature content for TSA
		/** @type {forge.md.digest} */
		var md = forge.md.sha256.create();
		md.update(signature);
		// Generate TSA request
		/** @type {forge.asn1} */
		var asn1Req = forge.asn1.create(
			forge.asn1.Class.UNIVERSAL,
			forge.asn1.Type.SEQUENCE,
			true,
			[
				// Version
				{
					composed: false,
					constructed: false,
					tagClass: forge.asn1.Class.UNIVERSAL,
					type: forge.asn1.Type.INTEGER,
					value: forge.asn1.integerToDer(1).data,
				},
				{
					composed: true,
					constructed: true,
					tagClass: forge.asn1.Class.UNIVERSAL,
					type: forge.asn1.Type.SEQUENCE,
					value: [
						{
							composed: true,
							constructed: true,
							tagClass: forge.asn1.Class.UNIVERSAL,
							type: forge.asn1.Type.SEQUENCE,
							value: [
								{
									composed: false,
									constructed: false,
									tagClass: forge.asn1.Class.UNIVERSAL,
									type: forge.asn1.Type.OID,
									value: forge.asn1.oidToDer(forge.oids.sha256).data,
								}, {
									composed: false,
									constructed: false,
									tagClass: forge.asn1.Class.UNIVERSAL,
									type: forge.asn1.Type.NULL,
									value: ""
								}
							]
						}, {// Message imprint
							composed: false,
							constructed: false,
							tagClass: forge.asn1.Class.UNIVERSAL,
							type: forge.asn1.Type.OCTETSTRING,
							value: md.digest().data,
						}
					]
				}, {
					composed: false,
					constructed: false,
					tagClass: forge.asn1.Class.UNIVERSAL,
					type: forge.asn1.Type.BOOLEAN,
					value: 1, // Get REQ certificates
				}
			]
		);

		return forge.asn1.toDer(asn1Req).data;
	}

	/**
	 * @private
	 * @param {string=} signature
	 * @return {forge.asn1}
	 */
	queryTsa(signature){
		/** @type {string} */
		var tsr = this.genTsrData(signature);
		/** @type {Uint8Array} */
		var tu8s = z.rawToU8arr(tsr);
		/** @type {UrlFetchParams} */
		var options = {
			"method": "POST",
			"headers": {"Content-Type": "application/timestamp-query"},
			"payload": tu8s,
		};
		/** @type {GBlob} */
		var tblob = UrlFetchApp.fetch(this.tsainf.url, options).getBlob();
		/** @type {string} */
		var tstr = z.u8arrToRaw(new Uint8Array(tblob.getBytes()));
		/** @type {forge.asn1} */
		var token = forge.asn1.fromDer(tstr).value[1];
		return token;
	}

	/**
	 * @private
	 * @param {string} msg
	 */
	log(msg){
		if(this.debug){
			console.log(msg);
		}
	}
};

z.VisualSignature = class{
	/**
	 * @param {SignDrawInfo=} drawinf
	 */
	constructor(drawinf){
		/** @private @type {number} */
		this.pgidx = 0;
		/** @private @type {Array<number>} */
		this.rect = [0, 0, 0, 0];
		/** @private @type {?SignDrawInfo} */
		this.drawinf = null;

		if(drawinf){
			this.drawinf = drawinf;
			if(this.drawinf.pageidx){
				this.pgidx = this.drawinf.pageidx;
			}
		}
	}

	/**
	 * @public
	 * @return {number}
	 */
	getPageIndex(){
		return this.pgidx;
	}

	/**
	 * @public
	 * @return {Array<number>}
	 */
	getSignRect(){
		return this.rect;
	}

	/**
	 * @public
	 * @param {PDFLib.PDFDocument} pdfdoc
	 * @param {string=} signame
	 * @return {PDFLib.PDFRef} The unique reference assigned to the signature stream
	 */
	createStream(pdfdoc, signame){
		if(!this.drawinf){
			return null;
		}else if(!(this.drawinf.img || (this.drawinf.font && this.drawinf.font))){
			return null;
		}

		/** @type {Array<PDFLib.PDFPage>} */
		var pages = pdfdoc.getPages();
		/** @type {PDFLib.PDFPage} */
		var page = null;
		if(this.pgidx < pages.length){
			page = pages[this.pgidx];
		}else{
			throw new Error("Page index is overflow to pdf pages.");
		}
		/** @type {PDFLib.Rotation} */
		var pgrot = page.getRotation();
		pgrot.angle = PDFLib.toDegrees(pgrot) % 360;
		pgrot.type = PDFLib.RotationTypes.Degrees;
		/** @type {PdfSize} */
		var pgsz = page.getSize();
		/** @type {SignAreaInfo} */
		var areainf = this.calcAreaInf(pgsz, pgrot.angle, this.drawinf.area);

		// resources object
		/** @type {Object<string, *>} */
		var rscObj = {};
		/** @type {Array<PDFLib.PDFOperator>} */
		var sigOprs = [];
		/** @type {string} */
		var imgName = signame ? signame.concat("Img") : "SigImg";
		/** @type {string} */
		var fontName = signame ? signame.concat("Font") : "SigFont";
		if(this.drawinf.img){
			// Get scaled image size
			/** @type {PdfSize} */
			var imgsz = this.drawinf.img.size();
			/** @type {number} */
			var tmp = areainf.w * imgsz.height / imgsz.width;
			if(tmp <= areainf.h){
				areainf.h = tmp;
			}else{
				areainf.w = areainf.h * imgsz.width / imgsz.height;
			}

			rscObj["XObject"] = {
				[imgName]: this.drawinf.img.ref,
			};
			sigOprs = sigOprs.concat(PDFLib.drawImage(imgName, this.calcDrawImgInf(pgrot, areainf)));
		}
		if(this.drawinf.font){
			rscObj["Font"] = {
				[fontName]: this.drawinf.font.ref,
			};
		}

		this.rect = this.calcRect(pgrot.angle, areainf);

		/** @type {PDFLib.PDFObject} */
		var frmDict = pdfdoc.context.obj({
			"Type": "XObject",
			"Subtype": "Form",
			"FormType": 1,
			"BBox": [0, 0, areainf.w, areainf.h],
			"Resources": rscObj,
		});
		/** @type {PDFLib.PDFContentStream} */
		var strm = PDFLib.PDFContentStream.of(frmDict, sigOprs, false);
		return pdfdoc.context.register(strm);
	}

	/**
	 * Calculate area informations for drawing signature after rotate
	 *
	 * @private
	 * @param {PdfSize} pgsz
	 * @param {number} angle
	 * @param {SignAreaInfo} visinf
	 * @return {SignAreaInfo}
	 */
	calcAreaInf(pgsz, angle, visinf){
		var ret = /** @type {SignAreaInfo} */(Object.assign({}, visinf));
		// Calculate position after rotate
		switch(angle){
		case 90:
			ret.w = visinf.h;
			ret.h = visinf.w;
			ret.x = visinf.y + visinf.h;
			ret.y = visinf.x;
			break;
		case 180:
		case -180:
			ret.x = pgsz.width - visinf.x;
			ret.y = visinf.y + visinf.h;
			break;
		case 270:
		case -90:
			ret.w = visinf.h;
			ret.h = visinf.w;
			ret.x = pgsz.width - visinf.y - visinf.h;
			ret.y = pgsz.height - visinf.x;
			break;
		default:
			ret.y = pgsz.height - visinf.y - visinf.h;
		}
		return ret;
	}

	/**
	 * @private
	 * @param {number} angle
	 * @param {SignAreaInfo} areainf // { x, y, w, h }
	 * @return {Array<number>}
	 */
	calcRect(angle, areainf){
		/** @type {Array<number>} */
		var rect = [0, 0, 0, 0];
		rect[0] = areainf.x;
		rect[1] = areainf.y;
		switch(angle){
		case 90:
			rect[2] = areainf.x - areainf.h;
			rect[3] = areainf.y + areainf.w;
			break;
		case 180:
		case -180:
			rect[2] = areainf.x - areainf.w;
			rect[3] = areainf.y - areainf.h;
			break;
		case 270:
		case -90:
			rect[2] = areainf.x + areainf.h;
			rect[3] = areainf.y - areainf.w;
			break;
		default:
			rect[2] = areainf.x + areainf.w;
			rect[3] = areainf.y + areainf.h;
		}
		return rect;
	}

	/**
	 * Calculate informations for drawing image after rotate
	 *
	 * @private
	 * @param {PDFLib.Rotation} rot
	 * @param {SignAreaInfo} areainf // { x, y, w, h }
	 * @return {PdfDrawimgOption}
	 */
	calcDrawImgInf(rot, areainf){
		/** @type {PdfDrawimgOption} */
		var ret = {
			"x": 0,
			"y": 0,
			"width": areainf.w,
			"height": areainf.h,
			"rotate": rot,
			"xSkew": PDFLib.degrees(0),
			"ySkew": PDFLib.degrees(0),
		};
		switch(rot.angle){
		case 90:
			ret["x"] = areainf.w;
			ret["width"] = areainf.h;
			ret["height"] = areainf.w;
			break;
		case 180:
		case -180:
			ret["x"] = areainf.w;
			ret["y"] = areainf.h;
			break;
		case 270:
		case -90:
			ret["y"] = areainf.h;
			ret["width"] = areainf.h;
			ret["height"] = areainf.w;
			break;
		}
		return ret;
	}
};

}

if(!globalThis.Zga){
	globalThis.Zga = {};
}
supplyZgaSigner(globalThis.Zga);
