'use strict';

// This module was migrated from [TCPDF](http://www.tcpdf.org)
/**
 * @param {Object<string, *>} z
 */
function supplyZgaCryptor(z){

/**
 * @param {PDFLib.PDFDocument|Array<number>|Uint8Array|ArrayBuffer|string} pdf
 * @return {Promise<PDFLib.PDFDocument>}
 */
z.loadPdf = async function(pdf){
	/** @type {PDFLib.PDFDocument} */
	var pdfdoc = null;
	if(pdf.addPage){
		pdfdoc = /** @type {PDFLib.PDFDocument} */(pdf);
	}else if(Array.isArray(pdf)){
		pdfdoc = await PDFLib.PDFDocument.load(new Uint8Array(pdf));
	}else{
		pdfdoc = await PDFLib.PDFDocument.load(/** @type {(ArrayBuffer|Uint8Array|string)} */(pdf));
	}
	return pdfdoc;
};

/**
 * @param {Uint8Array} uarr
 * @return {string}
 */
z.u8arrToRaw = function(uarr){
	/** @type {Array<string>} */
	var arr = [];
	for(var i=0; i<uarr.length; i++){
		arr.push(String.fromCharCode(uarr[i]));
	}
	return arr.join("");
};

/**
 * @param {string} raw
 * @return {Uint8Array}
 */
z.rawToU8arr = function(raw){
	/** @type {Uint8Array} */
	var arr = new Uint8Array(raw.length);
	for(var i=0; i<raw.length; i++){
		arr[i] = raw.charCodeAt(i);
	}
	return arr;
};

z.Crypto = {
	/**
	 * @enum {number}
	 */
	Mode: {
		RC4_40: 0,
		RC4_128: 1,
		AES_128: 2,
		AES_256: 3,
	},

	/**
	 * @enum {number}
	 */
	Permission: {
		"owner": 2, // bit 2 -- inverted logic: cleared by default
		"print": 4, // bit 3
		"modify": 8, // bit 4
		"copy": 16, // bit 5
		"annot-forms": 32, // bit 6
		"fill-forms": 256, // bit 9
		"extract": 512, // bit 10
		"assemble": 1024,// bit 11
		"print-high": 2048 // bit 12
	},

	/** @type {string} */
	EncPadding: "\x28\xBF\x4E\x5E\x4E\x75\x8A\x41\x64\x00\x4E\x56\xFF\xFA\x01\x08\x2E\x2E\x00\xB6\xD0\x68\x3E\x80\x2F\x0C\xA9\xFE\x64\x53\x69\x7A",

	/**
	 * Add "\" before "\", "(" and ")", and chr(13) => '\r'
	 * @param {string} s string to escape.
	 * @return {string} escaped string.
	 */
	_escape: function(s){
		if(!s){
			return s;
		}
		/** @const {Array<string>} */
		const CHARS = "\\()".split("");
		/** @type {Array<string>} */
		var arr = [];
		for(var i=0; i<s.length; i++){
			/** @type {string} */
			var c = s.charAt(i);
			if(c == "\r"){
				arr.push("\\r");
			}else{
				if(CHARS.indexOf(c) >= 0){
					arr.push("\\");
				}
				arr.push(c);
			}
		}
		return arr.join("");
	},

	/**
	 * Returns a string containing random data to be used as a seed for encryption methods.
	 * @param {string=} seed starting seed value
	 * @return {string} containing random data
	 */
	getRandomSeed: function(seed){
		/** @type {string} */
		var ret = forge.random.getBytesSync(256);
		if(seed){
			ret += seed;
		}
		ret += new Date().getTime();
		return ret;
	},

	/**
	 * Returns the input text encrypted using RC4 algorithm and the specified key.
	 * RC4 is the standard encryption algorithm used in PDF format
	 * @param {string} key Encryption key.
	 * @param {string} txt Input text to be encrypted.
	 * @param {RC4LastInfo} lastinf Last RC4 information.
	 * @return {string} encrypted text
	 */
	_RC4: function(key, txt, lastinf){
		/** @type {Array<number>} */
		var rc4 = null;
		/** @type {number} */
		var i = 0;
		/** @type {number} */
		var j = 0;
		/** @type {number} */
		var t = 0;
		if(lastinf.enckey != key){
			/** @type {string} */
			var k = key.repeat(256 / key.length + 1);
			rc4 = new Array(256);
			// Initialize rc4
			for(i=0; i<rc4.length; i++){
				rc4[i] = i;
			}
			for(i=0; i<rc4.length; i++){
				t = rc4[i];
				j = (j + t + k.charCodeAt(i)) % 256;
				rc4[i] = rc4[j];
				rc4[j] = t;
			}
			lastinf.enckey = key;
			lastinf.enckeyc = [].concat(rc4);
		}else{
			rc4 = [].concat(lastinf.enckeyc);
		}
		/** @type {number} */
		var len = txt.length;
		/** @type {number} */
		var a = 0;
		/** @type {number} */
		var b = 0;
		/** @type {string} */
		var out = "";
		for(i=0; i<len; i++){
			a = (a + 1) % 256;
			t = rc4[a];
			b = (b + t) % 256;
			rc4[a] = rc4[b];
			rc4[b] = t;
			k = rc4[(rc4[a] + rc4[b]) % 256];
			out += String.fromCharCode(txt.charCodeAt(i) ^ k);
		}
		return out;
	},

	/**
	 * Return the permission code used on encryption (P value).
	 *
	 * @param {Array<string>=} permissions the set of permissions (specify the ones you want to block).
	 * @param {z.Crypto.Mode=} mode
	 * @return {number}
	 */
	getUserPermissionCode: function(permissions, mode){
		/** @type {number} */
		var protection = 2147422012; // 32 bit: (01111111 11111111 00001111 00111100)
		if(permissions){
			permissions.forEach(function(a_itm){
				/** @type {number} */
				var a_p = z.Crypto.Permission[a_itm];
				if(a_p){
					if(mode > 0 || a_p <= 32){
						// set only valid permissions
						if(a_p == 2){
							// the logic for bit 2 is inverted (cleared by default)
							protection += a_p;
						}else{
							protection -= a_p;
						}
					}
				}
			});
		}
		return protection;
	},

	/**
	 * Convert encryption P value to a string of bytes, low-order byte first.
	 * @param {number} protection 32bit encryption permission value (P value)
	 * @return {string}
	 */
	getEncPermissionsString: function(protection){
		/** @type {forge.util.ByteStringBuffer} */
		var buff = new forge.util.ByteStringBuffer();
		buff.putInt32Le(protection);
		return buff.getBytes();
	},

	/**
	 * Encrypts a string using MD5 and returns it's value as a binary string.
	 * @param {string} str input string
	 * @return {string} MD5 encrypted binary string
	 */
	_md5_16: function(str){
		/** @type {forge.md.digest} */
		var md = forge.md.md5.create();
		md.update(str);
		return md.digest().getBytes();
	},

	/**
	 * Returns the input text encrypted using AES algorithm and the specified key.
	 * Text is padded to 16bytes blocks
	 * @param {string} key encryption key
	 * @param {string} txt input text to be encrypted
	 * @return {string} encrypted text
	 */
	_AES: function(key, txt){
		// padding (RFC 2898, PKCS #5: Password-Based Cryptography Specification Version 2.0)
		/** @type {number} */
		var padding = 16 - (txt.length % 16);
		/** @type {forge.util.ByteStringBuffer} */
		var buff = forge.util.createBuffer(txt);
		buff.fillWithByte(padding, padding);

		/** @type {string} */
		var iv = forge.random.getBytesSync(16);
		/** @type {forge.util.ByteStringBuffer} */
		var key2 = forge.util.createBuffer(key);
		/** @type {forge.cipher.BlockCipher} */
		var cipher = forge.cipher.createCipher("AES-CBC", key2);
		cipher.start({iv: iv});
		cipher.update(buff);
		cipher.finish();
		return iv + cipher.output.truncate(16).getBytes();
	},

	/**
	 * Returns the input text encrypted using AES algorithm and the specified key.
	 * Text is not padded
	 * @param {string} key encryption key
	 * @param {string} txt input text to be encrypted
	 * @return {string} encrypted text
	 */
	_AESnopad: function(key, txt) {
		/** @type {forge.util.ByteStringBuffer} */
		var buff = forge.util.createBuffer(txt);
		/** @type {string} */
		var iv = String.fromCharCode(0).repeat(16);
		/** @type {forge.util.ByteStringBuffer} */
		var key2 = forge.util.createBuffer(key);
		/** @type {forge.cipher.BlockCipher} */
		var cipher = forge.cipher.createCipher("AES-CBC", key2);
		cipher.start({iv: iv});
		cipher.update(buff);
		cipher.finish();
		return cipher.output.truncate(16).getBytes();
	},

};

z.PdfCryptor = class{
	/**
	 * @param {EncryptOption} encopt
	 */
	constructor(encopt){
		/** @private @type {string} */
		this.fileid = "";
		/** @private @type {string} */
		this.key = "";
		/** @private @type {Array<PubKeyInfo>|undefined} */
		this.pubkeys = encopt.pubkeys;
		/** @private @type {z.Crypto.Mode} */
		this.mode = /** @type {z.Crypto.Mode} */(encopt.mode);
		/** @private @type {number} */
		this.protection = 0;
		/** @private @type {string} */
		this.userpwd = "";
		/** @private @type {string} */
		this.ownerpwd = "";

		/** @private @type {string} */
		this.Filter = "Standard";
		/** @private @type {string} */
		this.StmF = "StdCF";
		/** @private @type {string} */
		this.StrF = "StdCF";

		/** @private @type {number} */
		this.V = 1;
		/** @private @type {number} */
		this.Length = 0;
		/** @private @type {?CFType} */
		this.CF = null;
		/** @private @type {string} */
		this.SubFilter = "";
		/** @private @type {Array<string>} */
		this.Recipients = null;

		/** @private @type {string} */// User Validation Salt
		this.UVS = "";
		/** @private @type {string} */// User Key Salt
		this.UKS = "";
		/** @private @type {string} */// U value
		this.U = "";
		/** @private @type {string} */// UE value
		this.UE = "";

		/** @private @type {string} */// Owner Validation Salt
		this.OVS = "";
		/** @private @type {string} */// Owner Key Salt
		this.OKS = "";
		/** @private @type {string} */// O value
		this.O = "";
		/** @private @type {string} */// OE value
		this.OE = "";
		/** @private @type {number} */// P value
		this.P = 0;
		/** @private @type {string} */
		this.perms = "";

		/** @private @type {RC4LastInfo} */
		this.rc4inf = {
			enckey: "",
			enckeyc: null,
		};

		if(this.pubkeys){
			if(this.mode == z.Crypto.Mode.RC4_40){
				// public-Key Security requires at least 128 bit
				this.mode = z.Crypto.Mode.RC4_128;
			}
			this.Filter = "Adobe.PubSec";
			this.StmF = "DefaultCryptFilter";
			this.StrF = "DefaultCryptFilter";
			throw new Error("Public key mode is not supported yet.");
		}

		if(encopt.userpwd){
			this.userpwd = encopt.userpwd;
		}
		if(encopt.ownerpwd){
			this.ownerpwd = encopt.ownerpwd;
		}else{
			/** @type {forge.md.digest} */
			var md = forge.md.md5.create();
			md.update(z.Crypto.getRandomSeed());
			this.ownerpwd = md.digest().toHex();
		}

		switch(this.mode){
		case z.Crypto.Mode.RC4_40:
			this.V = 1;
			this.Length = 40;
			this.CF = {CFM: "V2"};
			break;
		case z.Crypto.Mode.RC4_128:
			this.V = 2;
			this.Length = 128;
			this.CF = {CFM: "V2"};
			if(this.pubkeys){
				this.SubFilter = "adbe.pkcs7.s4";
				this.Recipients = [];
			}
			break;
		case z.Crypto.Mode.AES_128:
			this.V = 4;
			this.Length = 128;
			this.CF = {CFM: "AESV2", Length: 128};
			if(this.pubkeys){
				this.SubFilter = "adbe.pkcs7.s5";
				this.Recipients = [];
			}
			break;
		case z.Crypto.Mode.AES_256:
			this.V = 5;
			this.Length = 256;
			this.CF = {CFM: "AESV3", Length: 256};
			if(this.pubkeys){
				this.SubFilter = "adbe.pkcs7.s5";
				this.Recipients = [];
			}
			break;
		default:
			throw new Error("Unknown crypto mode. " + this.mode);
		}

		this.protection = z.Crypto.getUserPermissionCode(encopt.permissions, this.mode);
	}

	/**
	 * @public
	 * @param {PDFLib.PDFDocument|Array<number>|Uint8Array|ArrayBuffer|string} pdf
	 * @param {boolean=} reload
	 * @return {Promise<PDFLib.PDFDocument>}
	 *
	 * If the parameter of pdf is PDFLib.PDFDocument, and some embedded contents have been added to it,
	 * then the parameter of reload needs to be true. Because before the encryption, all changes must be applied.
	 * And if reload is true, the return value is a new pdf document, else is pdf itself.
	 */
	async encryptPdf(pdf, reload){
		/** @type {PDFLib.PDFDocument} */
		var pdfdoc = await z.loadPdf(pdf);
		if(pdfdoc === pdf && reload){
			// Temporaryly save the pdf and reload it to apply all changes.
			/** @type {Uint8Array} */
			var newpdf = await pdfdoc.save({"useObjectStreams": false});
			pdfdoc = await PDFLib.PDFDocument.load(newpdf);
		}

		/** @type {PDFLib.PDFContext} */
		var pdfcont = pdfdoc.context;
		/** @type {PDFLib.PDFObject} */
		var trobj = this.prepareEncrypt(pdfcont);

		/**
		 * @param {number} a_num
		 * @param {PDFLib.PDFObject} a_val
		 */
		var func = function(a_num, a_val){
			if(a_val instanceof PDFLib.PDFStream){
				if(a_val.contents){
					a_val.contents = this.encryptU8arr(a_num, a_val.contents);
				}
			}else if(a_val instanceof PDFLib.PDFHexString){
				if(a_val.value){
					a_val.value = this.encryptHexstr(a_num, a_val.value);
				}
			}else if(a_val instanceof PDFLib.PDFString){
				if(a_val.value){
					a_val.value = z.Crypto._escape(this._encrypt_data(a_num, a_val.value));
				}
			}
			if(a_val.dict instanceof Map){
				/** @type {Iterator} */
				var a_es = a_val.dict.entries();
				/** @type {IIterableResult<PdfObjEntry>} */
				var a_res = a_es.next();
				while(!a_res.done){
					func(a_num, a_res.value[1]);
					a_res = a_es.next();
				}
			}
		}.bind(this);
		pdfcont.enumerateIndirectObjects().forEach(function(/** @type {PdfObjEntry} */a_arr){
			func(a_arr[0].objectNumber, a_arr[1]);
		});

		pdfcont.trailerInfo.Encrypt = pdfcont.register(trobj);

		return pdfdoc;
	}

	/**
	 * Prepare for encryption and create the object for saving in trailer.
	 *
	 * @private
	 * @param {PDFLib.PDFContext} pdfcont
	 * @return {PDFLib.PDFObject}
	 */
	prepareEncrypt(pdfcont){
		if(!pdfcont.trailerInfo.ID){
			/** @type {forge.md.digest} */
			var md = forge.md.md5.create();
			md.update(z.Crypto.getRandomSeed());
			/** @type {forge.util.ByteStringBuffer} */
			var res = md.digest();
			/** @type {string} */
			var idhex = res.toHex();
			/** @type {string} */
			this.fileid = res.getBytes();

			/** @type {PDFLib.PDFArray} */
			var trIds = new PDFLib.PDFArray(pdfcont);
			trIds.push(PDFLib.PDFHexString.of(idhex));
			trIds.push(PDFLib.PDFHexString.of(idhex));
			pdfcont.trailerInfo.ID = trIds;

		}else{
			this.fileid = forge.util.hexToBytes(pdfcont.trailerInfo.ID.get(0).value);
		}
		this._generateencryptionkey();

		var obj = {};
		obj.Filter = this.Filter;
		if(this.SubFilter){
			obj.SubFilter = this.SubFilter;
		}
		// V is a code specifying the algorithm to be used in encrypting and decrypting the document
		obj.V = this.V;
		// The length of the encryption key, in bits. The value shall be a multiple of 8, in the range 40 to 256
		obj.Length = this.Length;
		if(this.V >= 4){
			// A dictionary whose keys shall be crypt filter names and whose values shall be the corresponding crypt filter dictionaries.
			if(this.CF){
				/** @type {Object<string, *>} */
				var objStmF = {
					Type: "CryptFilter",
				};
				// The method used
				if(this.CF.CFM){
					objStmF.CFM = this.CF.CFM;
					if(this.pubkeys){
						/** @type {PDFLib.PDFArray} */
						var recps1 = new PDFLib.PDFArray(pdfcont);
						this.Recipients.forEach(function(a_ele){
							recps1.push(PDFLib.PDFHexString.of(a_ele));
						});
						objStmF.Recipients = recps1;
						if(typeof this.CF.EncryptMetadata == "boolean" && !this.CF.EncryptMetadata){
							objStmF.EncryptMetadata = false;
						}else{
							objStmF.EncryptMetadata = true;
						}
					}
				}else{
					objStmF.CFM = "None";
				}
				// The event to be used to trigger the authorization that is required to access encryption keys used by this filter.
				if(this.CF.AuthEvent){
					objStmF.AuthEvent = this.CF.AuthEvent;
				}else{
					objStmF.AuthEvent = "DocOpen";
				}
				// The bit length of the encryption key.
				if(this.CF.Length){
					objStmF.Length = this.CF.Length;
				}

				/** @type {Object<string, *>} */
				var objCF = {
					[this.StmF]: pdfcont.obj(objStmF),
				};
				obj.CF = pdfcont.obj(objCF);
			}
			// The name of the crypt filter that shall be used by default when decrypting streams.
			obj.StmF = this.StmF;
			// The name of the crypt filter that shall be used when decrypting all strings in the document.
			obj.StrF = this.StrF;
		}
		// Additional encryption dictionary entries for the standard security handler
		if(this.pubkeys){
			if(this.V < 4 && this.Recipients && this.Recipients.length > 0){
				/** @type {PDFLib.PDFArray} */
				var recps = new PDFLib.PDFArray(pdfcont);
				this.Recipients.forEach(function(a_ele){
					recps.push(PDFLib.PDFHexString.of(a_ele));
				});
				obj.Recipients = recps;
			}
		}else{
			if(this.V == 5){ // AES-256
				obj.R = 5;
				obj.OE = PDFLib.PDFString.of(z.Crypto._escape(this.OE));
				obj.UE = PDFLib.PDFString.of(z.Crypto._escape(this.UE));
				obj.Perms = PDFLib.PDFString.of(z.Crypto._escape(this.perms));
			}else if(this.V == 4){ // AES-128
				obj.R = 4;
			}else if(this.V < 2){ // RC-40
				obj.R = 2;
			}else{ // RC-128
				obj.R = 3;
			}
			obj.O = PDFLib.PDFString.of(z.Crypto._escape(this.O));
			obj.U = PDFLib.PDFString.of(z.Crypto._escape(this.U));
			obj.P = this.P;
			if(typeof this.EncryptMetadata == "boolean" && !this.EncryptMetadata){
				obj.EncryptMetadata = false;
			}else{
				obj.EncryptMetadata = true;
			}
		}
		return pdfcont.obj(obj);
	}

	/**
	 * @private
	 * @param {number} num
	 * @param {Uint8Array} dat
	 * @return {Uint8Array}
	 */
	encryptU8arr(num, dat){
		/** @type {string} */
		var str = z.u8arrToRaw(dat);
		/** @type {string} */
		var enc = this._encrypt_data(num, str);
		return z.rawToU8arr(enc);
	}

	/**
	 * @private
	 * @param {number} num
	 * @param {string} dat
	 * @return {string}
	 */
	encryptHexstr(num, dat){
		/** @type {string} */
		var str = forge.util.hexToBytes(dat);
		/** @type {string} */
		var enc = this._encrypt_data(num, str);
		return forge.util.createBuffer(enc).toHex();
	}

	/**
	 * Compute encryption key depending on object number where the encrypted data is stored.
	 * This is used for all strings and streams without crypt filter specifier.
	 *
	 * @private
	 * @param {number} n object number
	 * @return {string} object key
	 */
	_objectkey(n){
		/** @type {forge.util.ByteStringBuffer} */
		var buff = forge.util.createBuffer(this.key);
		//pack('VXxx', $n)
		buff.putInt24Le(n);
		buff.putBytes(String.fromCharCode(0) + String.fromCharCode(0));
		if (this.mode == z.Crypto.Mode.AES_128) {
			// AES padding
			buff.putBytes("sAlT");
		}

		/** @type {forge.md.digest} */
		var md = forge.md.md5.create();
		md.update(buff.getBytes());
		/** @type {forge.util.ByteStringBuffer} */
		var ret = md.digest();
		return ret.getBytes().substr(0, Math.min(16, (this.Length / 8) + 5));
	}

	/**
	 * Encrypt the input string.
	 *
	 * @private
	 * @param {number} n object number
	 * @param {string} s data string to encrypt
	 * @return {string} encrypted string
	 */
	_encrypt_data(n, s){
		switch(this.mode){
		case z.Crypto.Mode.RC4_40:
		case z.Crypto.Mode.RC4_128:
			s = z.Crypto._RC4(this._objectkey(n), s, this.rc4inf);
			break;
		case z.Crypto.Mode.AES_128:
			s = z.Crypto._AES(this._objectkey(n), s);
			break;
		case z.Crypto.Mode.AES_256:
			s = z.Crypto._AES(this.key, s);
			break;
		}
		return s;
	}

	/**
	 * Compute U value (used for encryption)
	 * @private
	 * @return {string} U value
	 */
	_Uvalue(){
		/** @type {string} */
		var ret = "";
		if(this.mode == z.Crypto.Mode.RC4_40){
			ret = z.Crypto._RC4(this.key, z.Crypto.EncPadding, this.rc4inf);
		}else if(this.mode < z.Crypto.Mode.AES_256) { // RC4-128, AES-128
			/** @type {string} */
			var tmp = z.Crypto._md5_16(z.Crypto.EncPadding + this.fileid);
			/** @type {string} */
			var enc = z.Crypto._RC4(this.key, tmp, this.rc4inf);
			/** @type {number} */
			var len = tmp.length;
			for(var i=1; i<=19; i++){
				/** @type {string} */
				var ek = "";
				for(var j=0; j<len; j++){
					ek += String.fromCharCode(this.key.charCodeAt(j) ^ i);
				}
				enc = z.Crypto._RC4(ek, enc, this.rc4inf);
			}
			enc += String.fromCharCode(0).repeat(16);
			ret = enc.substr(0, 32);

		}else if(this.mode == z.Crypto.Mode.AES_256){
			/** @type {string} */
			var seed = z.Crypto._md5_16(z.Crypto.getRandomSeed());
			// User Validation Salt
			/** @type {string} */
			this.UVS = seed.substr(0, 8);
			// User Key Salt
			/** @type {string} */
			this.UKS = seed.substr(8, 16);

			/** @type {forge.md.digest} */
			var md = forge.md.sha256.create();
			md.update(this.userpwd + this.UVS);
			ret = md.digest().getBytes() + this.UVS + this.UKS;
		}
		return ret;
	}

	/**
	 * Compute UE value (used for encryption)
	 * @private
	 * @return {string} UE value
	 */
	_UEvalue(){
		/** @type {forge.md.digest} */
		var md = forge.md.sha256.create();
		md.update(this.userpwd + this.UKS);
		return z.Crypto._AESnopad(md.digest().getBytes(), this.key);
	}

	/**
	 * Compute O value (used for encryption)
	 * @private
	 * @return {string} O value
	 */
	_Ovalue(){
		/** @type {string} */
		var ret = "";
		if(this.mode < z.Crypto.Mode.AES_256){ // RC4-40, RC4-128, AES-128
			/** @type {string} */
			var tmp = z.Crypto._md5_16(this.ownerpwd);
			if(this.mode > z.Crypto.Mode.RC4_40){
				for(var i=0; i<50; i++){
					tmp = z.Crypto._md5_16(tmp);
				}
			}
			/** @type {string} */
			var owner_key = tmp.substr(0, this.Length / 8);
			ret = z.Crypto._RC4(owner_key, this.userpwd, this.rc4inf);
			if(this.mode > z.Crypto.Mode.RC4_40){
				/** @type {number} */
				var len = owner_key.length;
				for(var i=1; i<=19; i++){
					/** @type {string} */
					var ek = "";
					for(var j=0; j<len; j++){
						ek += String.fromCharCode(owner_key.charCodeAt(j) ^ i);
					}
					ret = z.Crypto._RC4(ek, ret, this.rc4inf);
				}
			}
		}else if(this.mode == z.Crypto.Mode.AES_256){
			/** @type {string} */
			var seed = z.Crypto._md5_16(z.Crypto.getRandomSeed());
			// Owner Validation Salt
			/** @type {string} */
			this.OVS = seed.substr(0, 8);
			// Owner Key Salt
			/** @type {string} */
			this.OKS = seed.substr(8, 16);

			/** @type {forge.md.digest} */
			var md = forge.md.sha256.create();
			md.update(this.ownerpwd + this.OVS + this.U);
			ret = md.digest().getBytes() + this.OVS + this.OKS;
		}
		return ret;
	}

	/**
	 * Compute OE value (used for encryption)
	 * @private
	 * @return {string} OE value
	 */
	_OEvalue(){
		/** @type {forge.md.digest} */
		var md = forge.md.sha256.create();
		md.update(this.ownerpwd + this.OKS + this.U);
		return z.Crypto._AESnopad(md.digest().getBytes(), this.key);
	}

	/**
	 * Convert password for AES-256 encryption mode
	 * @private
	 * @param {string} pwd password
	 * @return {string} password
	 */
	_fixAES256Password(pwd) {
		return pwd.substr(0, 127);
	}

	/**
	 * Compute encryption key
	 * @private
	 */
	_generateencryptionkey(){
		/** @type {number} */
		var keybytelen = this.Length / 8;
		// standard mode
		if(!this.pubkeys){
			if(this.mode == z.Crypto.Mode.AES_256){
				// generate 256 bit random key
				/** @type {forge.md.digest} */
				var md = forge.md.sha256.create();
				md.update(z.Crypto.getRandomSeed());
				this.key = md.digest().getBytes().substr(0, keybytelen);
				// truncate passwords
				this.userpwd = this._fixAES256Password(this.userpwd);
				this.ownerpwd = this._fixAES256Password(this.ownerpwd);
				// Compute U value
				this.U = this._Uvalue();
				// Compute UE value
				this.UE = this._UEvalue();
				// Compute O value
				this.O = this._Ovalue();
				// Compute OE value
				this.OE = this._OEvalue();
				// Compute P value
				this.P = this.protection;
				// Computing the encryption dictionary's Perms (permissions) value
				/** @type {string} */
				var perms = z.Crypto.getEncPermissionsString(this.protection); // bytes 0-3
				perms += String.fromCharCode(255).repeat(4); // bytes 4-7
				if(typeof this.CF.EncryptMetadata == "boolean" && !this.CF.EncryptMetadata){ // byte 8
					perms += "F";
				}else{
					perms += "T";
				}
				perms += "adb"; // bytes 9-11
				perms += "nick"; // bytes 12-15
				this.perms = z.Crypto._AESnopad(this.key, perms);
			}else{ // RC4-40, RC4-128, AES-128
				// Pad passwords
				this.userpwd = (this.userpwd + z.Crypto.EncPadding).substr(0, 32);
				this.ownerpwd = (this.ownerpwd + z.Crypto.EncPadding).substr(0, 32);
				// Compute O value
				this.O = this._Ovalue();
				// get default permissions (reverse byte order)
				/** @type {string} */
				var permissions = z.Crypto.getEncPermissionsString(this.protection);
				// Compute encryption key
				/** @type {string} */
				var tmp = z.Crypto._md5_16(this.userpwd + this.O + permissions + this.fileid);
				if(this.mode > z.Crypto.Mode.RC4_40) {
					for(var i=0; i<50; i++){
						tmp = z.Crypto._md5_16(tmp.substr(0, keybytelen));
					}
				}
				this.key = tmp.substr(0, keybytelen);
				// Compute U value
				this.U = this._Uvalue();
				// Compute P value
				this.P = this.protection;
			}
		}else{ // Public-Key mode
			//TODO
		}
	}
};

}

if(!globalThis.Zga){
	globalThis.Zga = {};
}
supplyZgaCryptor(globalThis.Zga);
