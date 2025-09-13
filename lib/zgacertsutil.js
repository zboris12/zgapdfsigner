'use strict';

/**
 * @param {Object<string, *>} z
 */
function supplyZgaCertsChain(z){

//Only for nodejs Start//
if(z.forge){
	var forge = z.forge;
}
//Only for nodejs End//

/**
 * When converting the issuer of signature to asn1, forge will encode the
 * value of issuer to utf8 if the valueTagClass is UTF8.
 * But the value load from a file which is DER format, is already utf8 encoded,
 * so the encoding action will break the final data.
 * To avoid the broken data issue, we decode the value before the later actions.
 * @param {forge_cert} cert
 */
z.fixCertAttributes = function(cert){
	cert.issuer.attributes.forEach(function(a_ele){
		if(a_ele.valueTagClass === forge.asn1.Type.UTF8){
			a_ele.value = forge.util.decodeUtf8(a_ele.value);
		}
	});
};

/**
 * @param {forge.asn1|string} asnder
 * @return {forge_cert}
 */
z.loadCert = function(asnder){
	/** @type {forge.asn1} */
	var asn1 = null;
	if(typeof asnder === "string"){
		asn1 = forge.asn1.fromDer(asnder);
	}else{
		asn1 = asnder;
	}
	/** @type {forge_cert} */
	var cert = forge.pki.certificateFromAsn1(asn1);
	return cert;
};

/**
 * @param {string} oid
 * @return {string}
 */
z.oidToDstr = function(oid){
	return forge.asn1.oidToDer(oid).getBytes();
};

/**
 * @param {forge.asn1} asn1
 * @param {Object<string, *>} vadt
 * @param {string|Array<string>=} oid
 * @return {Object<string, *>}
 */
z.parseAsn1 = function(asn1, vadt, oid){
	/** @type {Object<string, *>} */
	var capt = {};
	/** @type {Array<string>} */
	var errs = [];
	forge.asn1.validate(asn1, vadt, capt, errs);
	if(errs.length > 0){
// console.log(errs);
		return null;
	}else if(oid){
		if(capt.oid){
			if(Array.isArray(oid)){
				if(oid.indexOf(capt.oid) >= 0){
					return capt;
				}else{
					return null;
				}
			}else if(oid == capt.oid){
				return capt;
			}else{
				return null;
			}
		}else{
			return null;
		}
	}else{
		return capt;
	}
};

/**
 * @param {string|number|boolean|forge.asn1|Array<forge.asn1>} aval
 * @param {number=} atyp
 * @param {number=} atag
 * @return {forge.asn1}
 */
z.createAsn1 = function(aval, atyp, atag){
	/** @lends {forge.asn1} */
	const asn1 = forge.asn1;
	/** @lends {forge.asn1.Class} */
	const asnc = asn1.Class;
	/** @lends {forge.asn1.Type} */
	const asnt = asn1.Type;
	/** @type {string|number|forge.asn1|Array<forge.asn1>} */
	var a_val = null;
	/** @type {number} */
	var a_typ = (atyp || atyp === asnt.NONE) ? atyp : -1;
	/** @type {boolean} */
	var a_con = false;
	if(Array.isArray(aval)){
		a_con = true;
	}else{
		switch(typeof aval){
		case "string":
			if(a_typ == asnt.OID){
				a_val = asn1.oidToDer(aval).getBytes();
			}else if(a_typ < 0){
				a_typ = asnt.OCTETSTRING;
			}
			break;
		case "number":
			a_val = asn1.integerToDer(aval).getBytes();
			if(a_typ < 0){
				a_typ = asnt.INTEGER;
			}
			break;
		case "boolean":
			if(aval){
				a_val = 1;
			}else{
				a_val = 0;
			}
			if(a_typ < 0){
				a_typ = asnt.BOOLEAN;
			}
		}
	}
	if(a_typ < 0){
		a_typ = asnt.SEQUENCE;
	}
	if(!a_val && a_val !== 0){
		a_val = /** @type {Array|forge.asn1|number|string} */(aval);
	}
	return asn1.create(atag ? atag : asnc.UNIVERSAL, a_typ, a_con, a_val);
};

/**
 * @param {string} url
 * @param {forge.asn1} asn1Req
 * @param {Object<string, *>} headers
 * @return {Promise<Uint8Array>}
 */
z.queryAsn1 = async function(url, asn1Req, headers){
	/** @type {string} */
	var tsr = forge.asn1.toDer(asn1Req).getBytes();
	/** @type {Uint8Array} */
	var tu8s = z.rawToU8arr(tsr);
	/** @type {UrlFetchParams} */
	var options = {
		"method": "POST",
		"headers": headers,
		"payload": tu8s,
	};
	/** @type {Uint8Array} */
	var tesp = await z.urlFetch(url, options);
	// /** @type {string} */
	// var tstr = z.u8arrToRaw(tesp);
	return tesp;
};

/**
 * @param {forge_cert} cert1
 * @param {forge_cert} cert2
 * @return {boolean}
 */
z.sameCert = function(cert1, cert2){
	/** @type {forge_cert_issuer} */
	var c1 = cert1.subject;
	/** @type {forge_cert_issuer} */
	var c2 = cert2.subject;
	if(c1.attributes.length === c2.attributes.length) {
		// all attributes are the same so issuer matches subject
		/** @type {?forge_cert_attr} */
		var attr1 = null;
		/** @type {?forge_cert_attr} */
		var attr2 = null;
		for(var n = 0; n < c1.attributes.length; n++) {
			attr1 = c1.attributes[n];
			attr2 = c2.attributes[n];
			if(attr1.type !== attr2.type || attr1.value !== attr2.value){
				// attribute mismatch
				return false;
			}
		}
		return true;
	}else{
		return false;
	}
};

z.CertsChain = class{
	/**
	 * @param {Array<forge_cert|forge.asn1|string>=} certs
	 */
	constructor(certs){
		/** @private @lends {forge.asn1} */
		this.asn1 = forge.asn1;
		/** @private @lends {forge.asn1.Class} */
		this.asnc = forge.asn1.Class;
		/** @private @lends {forge.asn1.Type} */
		this.asnt = forge.asn1.Type;
		/** @private @const {string} */
		this.ocsp_oid = z.oidToDstr("1.3.6.1.5.5.7.48.1");
		/** @private @const {string} */
		this.issuer_oid = z.oidToDstr("1.3.6.1.5.5.7.48.2");
		/** @private @const {string} */
		this.ocspBasic_oid = z.oidToDstr("1.3.6.1.5.5.7.48.1.1");
		/** @private @const {Object<string, *>} */
		this.oidval_validator = {
			name: "Seq",
			tagClass: this.asnc.UNIVERSAL,
			type: this.asnt.SEQUENCE,
			constructed: true,
			value: [{
				name: "Oid",
				tagClass: this.asnc.UNIVERSAL,
				type: this.asnt.OID,
				constructed: false,
				capture: "oid",
			}, {
				name: "Ovalue",
				tagClass: this.asnc.CONTEXT_SPECIFIC,
				type: 6,
				constructed: false,
				capture: "oval",
			}],
		};
		/** @private @const {Object<string, *>} */
		this.oresp_validator = {
			tagClass: this.asnc.UNIVERSAL,
			type: this.asnt.SEQUENCE,
			constructed: true,
			value: [{
				name: "Status",
				tagClass: this.asnc.UNIVERSAL,
				type: this.asnt.ENUMERATED,
				constructed: false,
				capture: "status",
			}, {
				tagClass: this.asnc.CONTEXT_SPECIFIC,
				type: 0,
				constructed: true,
				value: [{
					tagClass: this.asnc.UNIVERSAL,
					type: this.asnt.SEQUENCE,
					constructed: true,
					value: [{
						name: "Oid",
						tagClass: this.asnc.UNIVERSAL,
						type: this.asnt.OID,
						constructed: false,
						capture: "oid",
					}, {
						name: "OcspBasic",
						tagClass: this.asnc.UNIVERSAL,
						type: this.asnt.OCTETSTRING,
						constructed: false,
						capture: "ob",
					}],
				}],
			}],
		};
		/** @private @const {Object<string, *>} */
		this.ob_validator = {
			tagClass: this.asnc.UNIVERSAL,
			type: this.asnt.SEQUENCE,
			constructed: true,
			value: [{
				tagClass: this.asnc.UNIVERSAL,
				type: this.asnt.SEQUENCE,
				constructed: true,
			}, {
				tagClass: this.asnc.UNIVERSAL,
				type: this.asnt.SEQUENCE,
				constructed: true,
			}, {
				tagClass: this.asnc.UNIVERSAL,
				type: this.asnt.BITSTRING,
				constructed: false,
			}, {
				tagClass: this.asnc.CONTEXT_SPECIFIC,
				type: 0,
				constructed: true,
				optional: true,
				value: [{
					name: "Certs",
					tagClass: this.asnc.UNIVERSAL,
					type: this.asnt.SEQUENCE,
					constructed: true,
					capture: "certs",
				}],
			}],
		};

		/** @private @type {Array<forge_cert>} */
		this.certs = null;
		/** @private @type {forge_cert} */
		this.rootCert = null;
		/** @private @type {Array<string>} */
		this.crls = null;
		/** @private @type {Array<OcspData>} */
		this.ocspDatas = null;
		/** @private @type {Array<z.CertsChain>} */
		this.extraChains = null;
		/** @private @type {boolean} */
		this.ocspOk = false;

		if(certs){
			this.setCerts(certs);
		}
	}

	/**
	 * @public
	 * @param {Array<forge_cert|forge.asn1|string>} certs
	 */
	setCerts(certs){
		/** @type {z.CertsChain} */
		var _this = this;
		/** @type {Array<forge_cert>} */
		var fcertarr = [];
		_this.certs = [];
		/** @type {forge_cert} */
		var wkcert = null;
		certs.forEach(function(/** @type {forge_cert|forge.asn1|string} */a_data){
			if(a_data.issuer){
				wkcert = /** @type {forge_cert} */(a_data);
			}else{
				wkcert = z.loadCert(/** @type {forge.asn1|string} */(a_data));
			}
			if(wkcert.isIssuer(wkcert)){
				// A selfSigned cert is a root cert.
				_this.rootCert = wkcert;
			}else{
				/** @type {forge_cert_extension} */
				var bext = wkcert.getExtension("basicConstraints");
				if(bext && bext.cA){
					fcertarr.push(wkcert);
				}else{
					_this.certs.push(wkcert);
				}
			}
		});
		/** @type {number} */
		var cnt = fcertarr.length;
		if(_this.certs.length == 1){
			wkcert = _this.certs[0];
			while(cnt > 0){
				for(var j=0; j<fcertarr.length; j++){
					if(fcertarr[j] && wkcert.isIssuer(fcertarr[j])){
						wkcert = fcertarr[j];
						_this.certs.push(wkcert);
						fcertarr[j] = null;
						cnt--;
					}
				}
			}
		}else if(cnt > 0){
			_this.certs.push(fcertarr.pop());
			cnt--;
			while(cnt > 0){
				for(var j=0; j<fcertarr.length; j++){
					if(fcertarr[j]){
						for(var k=0; k<_this.certs.length; k++){
							wkcert = _this.certs[k];
							if(wkcert.isIssuer(fcertarr[j])){
								_this.certs.splice(k+1, 0, fcertarr[j]);
								fcertarr[j] = null;
								cnt--;
								break;
							}else if(fcertarr[j].isIssuer(wkcert)){
								_this.certs.splice(k, 0, fcertarr[j]);
								fcertarr[j] = null;
								cnt--;
								break;
							}
						}
					}
				}
			}
		}
	}

	/**
	 * @public
	 * @return {forge_cert}
	 */
	getSignCert(){
		if(this.certs.length > 0){
			return this.certs[0];
		}else{
			return this.rootCert;
		}
	}

	/**
	 * @public
	 * @return {boolean}
	 */
	isSelfSignedCert(){
		return (this.certs.length == 0);
	}

	/**
	 * @public
	 * @return {Array<forge_cert>}
	 */
	getAllCerts(){
		/** @type {Array<forge_cert>} */
		var ret = [].concat(this.certs);
		if(this.rootCert){
			ret.push(this.rootCert);
		}
		return ret;
	}

	/**
	 * @public
	 * @param {forge_cert} cert
	 * @return {boolean}
	 */
	isCertInChain(cert){
		return this.isCertInArray(this.getAllCerts(), cert);
	}

	/**
	 * @public
	 * @param {forge_cert} cert
	 * @return {Promise<boolean>}
	 */
	async buildChain(cert){
		/** @type {z.CertsChain} */
		var _this = this;
		if(cert.isIssuer(cert)){
			_this.certs = [];
			_this.rootCert = cert;
		}else{
			_this.certs = [cert];
			_this.rootCert = null;
		}
		return /** @type {boolean} */(await _this.amendRootCert());
	}

	/**
	 * @public
	 * @param {boolean=} crlOnly
	 * @return {Promise<DSSInfo>}
	 */
	async prepareDSSInf(crlOnly){
		/** @type {z.CertsChain} */
		var _this = this;
		var flg = /** @type {boolean} */(await _this.amendRootCert());
		if(!flg){
			throw new Error("Can't prepare DSS infomation because of unable to find the root certificate.");
		}

		if(crlOnly){
			flg = false;
		}else{
			_this.ocspDatas = [];
			_this.extraChains = [];
			flg = await _this.checkAllOcsps(_this.extraChains);
		}
		/** @type {Array<Uint8Array>} */
		var ocsps = [];
		/** @type {Array<forge_cert>} */
		var certs = [];
		if(flg){
			_this.ocspDatas.forEach(function(/** @type {OcspData} */a_dat){
				ocsps.push(a_dat.resp);
			});
			_this.extraChains.forEach(function(/** @type {z.CertsChain} */a_chain){
				a_chain.ocspDatas.forEach(function(/** @type {OcspData} */b_dat){
					ocsps.push(b_dat.resp);
				});
				a_chain.certs.forEach(function(/** @type {forge_cert} */b_cert){
					if(!(_this.isCertInArray(_this.certs, b_cert) || _this.isCertInArray(certs, b_cert))){
						certs.push(b_cert);
					}
				});
			});
		}

		/** @type {Array<Uint8Array>} */
		var crls = [];
		if(!flg){
			_this.crls = [];
			for(var i=0; i<_this.certs.length; i++){
				/** @type {forge.asn1} */
				var cdpts = _this.getExtAsn1(_this.certs[i], "cRLDistributionPoints"); //"2.5.29.31"
				if(cdpts){
					_this.findCrls(cdpts);
				}
			}

			for(var i=0; i<_this.crls.length; i++){
				z.log("Query crl for [" + _this.crls[i] + "]");
				const url = _this.crls[i];
				// A query of the Certificate Revocation List (CRL) via LDAP is unnecessary during the signing process.
				if(url.slice(0,4)==='ldap') continue;
				/** @type {Uint8Array} */
				var crl = await z.urlFetch(url);
				if(crl){
					crls.push(crl);
				}
			}
		}

		/** @type {DSSInfo} */
		var ret = {};
		if(certs.length > 0){
			ret.certs = certs;
		}
		if(ocsps.length > 0){
			ret.ocsps = ocsps;
		}
		if(crls.length > 0){
			ret.crls = crls;
		}
		return ret;
	}

	/**
	 * @private
	 * @return {Promise<!boolean>}
	 */
	async amendRootCert(){
		while(!this.rootCert){
			/** @type {forge_cert} */
			var cert = await this.queryIssuerCert(-1);
			if(!cert){
				return false;
			}
		}
		return true;
	}

	/**
	 * @private
	 * @param {forge_cert|number} certIdx
	 * @return {Promise<forge_cert>}
	 */
	async queryIssuerCert(certIdx){
		/** @type {z.CertsChain} */
		var _this = this;
		/** @type {forge_cert} */
		var cert = null;
		if(typeof certIdx === "number"){
			if(certIdx < 0){
				cert = _this.certs[_this.certs.length - 1];
			}else{
				cert = _this.certs[certIdx];
			}
		}else{
			cert = /** @type {forge_cert} */(certIdx);
		}
		/** @type {forge.asn1} */
		var aiass = _this.getExtAsn1(cert, "authorityInfoAccess");
		if(!aiass){
			return null;
		}
		/** @type {string} */
		var issuerUrl = _this.findOidValue(aiass, _this.issuer_oid);
		if(!issuerUrl){
			return null;
		}
		z.log("Query certificate of [" + issuerUrl + "]");
		/** @type {Uint8Array} */
		var u8cert = await z.urlFetch(issuerUrl);
		if(!u8cert){
			return null;
		}
		cert = z.loadCert(z.u8arrToRaw(u8cert));
		if(typeof certIdx === "number"){
			if(cert.isIssuer(cert)){
				_this.rootCert = cert;
			}else if(certIdx < 0){
				_this.certs.push(cert);
			}else{
				_this.certs[certIdx + 1] = cert;
			}
		}
		return cert;
	}

	/**
	 * @private
	 * @param {Array<z.CertsChain>} xchains
	 * @return {Promise<boolean>}
	 */
	async checkAllOcsps(xchains){
		/** @type {z.CertsChain} */
		var _this = this;
		/** @type {number} */
		var i = 0;
		/** @type {boolean} */
		var ret = (_this.certs.length > 0);
		for(i=0; i<_this.certs.length; i++){
			if(!(await _this.queryOcsp(i, xchains))){
				ret = false;
				break;
			}
		}
		_this.ocspOk = ret;
		return ret;
	}

	/**
	 * @private
	 * @param {number} idx
	 * @param {Array<z.CertsChain>} xchains
	 * @return {Promise<boolean>}
	 */
	async queryOcsp(idx, xchains){
		/** @type {z.CertsChain} */
		var _this = this;

		/** @type {forge_cert} */
		var cert = _this.certs[idx];
		z.log("Query ocsp for [" + cert.subject.getField("CN").value + "]");
		/** @type {string} */
		var ocspUrl = "";
		/** @type {forge.asn1} */
		var aiass = _this.getExtAsn1(cert, "authorityInfoAccess"); //"1.3.6.1.5.5.7.1.1"
		if(aiass){
			ocspUrl = _this.findOidValue(aiass, _this.ocsp_oid);
		}
		if(!ocspUrl){
			z.log("Can't find the url of ocsp.");
			return false;
		}
		/** @type {string} */
		var serialNum = z.u8arrToRaw(forge.util.binary.hex.decode(cert.serialNumber));

		/** @type {number} */
		var pidx = idx + 1;
		/** @type {forge_cert} *///parent cert(issuer cert)
		var pcert = pidx < _this.certs.length ? _this.certs[pidx] : _this.rootCert;
		/** @type {forge.asn1} */
		var subjectAsn1 = forge.pki.distinguishedNameToAsn1(pcert.subject);
		/** @type {forge.asn1} */
		var publicKeyAsn1 = forge.pki.publicKeyToRSAPublicKey(pcert.publicKey);
		/** @type {string} */
		var dnsha1 = _this.sha1(subjectAsn1);
		/** @type {string} */
		var keysha1 = _this.sha1(publicKeyAsn1);
		/** @type {string} */
		var nonce = forge.random.getBytesSync(16);
		nonce = _this.asn1.toDer(z.createAsn1(nonce)).getBytes();
		/** @type {forge.asn1} */
		var asn1Req = z.createAsn1([
			z.createAsn1([
				z.createAsn1([
					z.createAsn1([
						z.createAsn1([
							z.createAsn1([
								z.createAsn1(forge.oids.sha1, _this.asnt.OID),
								z.createAsn1("", _this.asnt.NULL),
							]),
							z.createAsn1(dnsha1),
							z.createAsn1(keysha1),
							z.createAsn1(serialNum, _this.asnt.INTEGER),
						])
					])
				]),
				z.createAsn1([
					z.createAsn1([
						z.createAsn1([
							z.createAsn1("1.3.6.1.5.5.7.48.1.2", _this.asnt.OID), //OCSP Nonce
							z.createAsn1(nonce),
						])
					])
				], 2, _this.asnc.CONTEXT_SPECIFIC)
			])
		]);

		/** @type {Object<string, *>} */
		var hds = {
			"Content-Type": "application/ocsp-request",
		};
		/** @type {Uint8Array} */
		var ou8arr = await z.queryAsn1(ocspUrl, asn1Req, hds);
// console.log(forge.util.createBuffer(ou8arr).toHex());
		/** @type {forge.asn1} */
		var asn1Oresp = _this.asn1.fromDer(z.u8arrToRaw(ou8arr));
		/** @type {Object<string, *>} */
		var ocapt = z.parseAsn1(asn1Oresp, _this.oresp_validator, _this.ocspBasic_oid);
		if(ocapt){
			/** @type {number} */
			var respsts = ocapt.status.charCodeAt(0);
			if(respsts != 0){
				/** @type {string} */
				var msg = "ocsp response is not successful. ";
				switch(respsts){
				case 1:
					msg += "malformedRequest";
					break;
				case 2:
					msg += "internalError";
					break;
				case 3:
					msg += "tryLater";
					break;
				case 5:
					msg += "sigRequired";
					break;
				case 6:
					msg += "unauthorized";
					break;
				default:
					msg += "unknown error";
				}
				msg += "(" + respsts + ")";
				z.log(msg);
				return false;
			}
		}else{
			z.log("ocsp response is an unknown format.");
			return false;
		}
		if(ocapt.ob){
			/** @type {forge.asn1} */
			var asn1Obasic = _this.asn1.fromDer(ocapt.ob);
			/** @type {Object<string, *>} */
			var obcapt = z.parseAsn1(asn1Obasic, _this.ob_validator);
			if(obcapt){
				_this.ocspDatas[idx] = {
					resp: ou8arr,
				};
				if(obcapt.certs){
					/** @type {z.CertsChain} */
					var xchain = new z.CertsChain(obcapt.certs);
					/** @type {number} */
					var i = 0;
					for(i=0; i<xchains.length; i++){
						if(xchains[i].isCertInChain(xchain.getSignCert())){
							xchain = null;
							break;
						}
					}
					_this.ocspDatas[idx].cchainIdx = i;
					if(xchain){
						/** @type {boolean} */
						var ocspNoCheck = true;
						xchain.certs.forEach(function(/** @type {forge_cert} */a_cert){
							if(ocspNoCheck && !a_cert.getExtension({id: "1.3.6.1.5.5.7.48.1.5"})){
								ocspNoCheck = false;
							}
						});
						if(ocspNoCheck){
							xchain.ocspOk = true;
						}else{
							xchains.push(xchain);
							await xchain.amendRootCert();
							await xchain.checkAllOcsps(xchains);
						}
					}else{
						xchain = xchains[i];
					}
					return xchain.ocspOk;
				}else{
					return true;
				}
			}else{
				z.log("ocsp basic is an unknown format.");
				return false;
			}
		}else{
			z.log("There is no ocsp basic in ocsp response.");
			return false;
		}
	}

	/**
	 * @private
	 * @param {forge_cert} cert
	 * @param {string|forge_cert_extension} nm
	 * @return {forge.asn1}
	 */
	getExtAsn1(cert, nm){
		/** @type {forge_cert_extension} */
		var ext = cert.getExtension(nm);
		if(ext){
			return this.asn1.fromDer(/** @type {string} */(ext.value));
		}else{
			return null;
		}
	}

	/**
	 * @private
	 * @param {forge.asn1} asn1
	 */
	findCrls(asn1){
		/** @type {z.CertsChain} */
		var _this = this;
		if(Array.isArray(asn1.value)){
			asn1.value.forEach(function(/** @type {forge.asn1} */a_asn1){
				_this.findCrls(a_asn1);
			});
		}else{
			var crl = /** @type {string} */(asn1.value);
			if(_this.crls.indexOf(crl) < 0){
				_this.crls.push(crl);
			}
		}
	}

	/**
	 * @private
	 * @param {forge.asn1} asn1
	 * @param {string} oid
	 * @return {string}
	 */
	findOidValue(asn1, oid){
		/** @type {z.CertsChain} */
		var _this = this;
		/** @type {Object<string, *>} */
		var capt = z.parseAsn1(asn1, _this.oidval_validator, oid);
		if(capt && capt.oval){
			return capt.oval;
		}
		var oval = "";
		if(Array.isArray(asn1.value)){
			for(var i=0; i<asn1.value.length; i++){
				oval = _this.findOidValue(asn1.value[i], oid);
				if(oval){
					break;
				}
			}
		}
		return oval;
	}

	/**
	 * @private
	 * @param {forge.asn1} asn1
	 * @return {string}
	 */
	sha1(asn1){
		var sha = forge.md.sha1.create();
		sha.update(this.asn1.toDer(asn1).getBytes());
		return sha.digest().getBytes();
	}

	/**
	 * @private
	 * @param {Array<forge_cert>} certs
	 * @param {forge_cert} cert
	 * @return {boolean}
	 */
	isCertInArray(certs, cert){
		/** @type {number} */
		var i = 0;
		for(i=0; i<certs.length; i++){
			if(z.sameCert(certs[i], cert)){
				return true;
			}
		}
		return false;
	}
}

z.TsaFetcher = class{
	/**
	 * @param {TsaServiceInfo} inf
	 */
	constructor(inf){
		/** @private @lends {forge.asn1} */
		this.asn1 = forge.asn1;
		/** @private @lends {forge.asn1.Class} */
		this.asnc = forge.asn1.Class;
		/** @private @lends {forge.asn1.Type} */
		this.asnt = forge.asn1.Type;
		/** @public @type {string} */
		this.url = inf.url;
		/** @public @type {number} */
		this.len = inf.len ? inf.len : 0;
		/** @private @type {Object<string, *>|undefined} */
		this.headers = inf.headers;

		/** @private @type {forge.asn1} */
		this.respAsn1 = null;
	}

	/**
	 * @public
	 * @param {string=} data
	 * @return {Promise<string>} Error message
	 */
	async queryTsa(data){
		/** @type {z.TsaFetcher} */
		var _this = this;
		// Generate SHA256 hash from data for TSA
		/** @type {forge.md.digest} */
		var md = forge.md.sha256.create();
		md.update(data);

		// Generate TSA request
		/** @type {forge.asn1} */
		var asn1Req = z.createAsn1([
			// Version
			z.createAsn1(1),
			z.createAsn1([
				z.createAsn1([
					z.createAsn1(forge.oids.sha256, _this.asnt.OID),
					z.createAsn1("", _this.asnt.NULL),
				]),
				// Message imprint
				z.createAsn1(md.digest().getBytes()),
			]),
			// Get REQ certificates
			z.createAsn1(true),
		]);

		/** @type {Object<string, *>} */
		var hds = _this.headers ? _this.headers : {};
		if(!hds["Content-Type"]){
			hds["Content-Type"] = "application/timestamp-query";
		}
		/** @type {Uint8Array} */
		var tu8arr = await z.queryAsn1(_this.url, asn1Req, hds);
		/** @type {string} */
		var tstr = z.u8arrToRaw(tu8arr);
// console.log(forge.util.createBuffer(tstr).toHex());
		_this.respAsn1 = _this.asn1.fromDer(tstr);
		/** @type {string} */
		var respsts = _this.respAsn1.value[0].value[0].value;
		if(respsts == "\x00"){
			return "";
		}else{
			/** @type {forge.asn1} */
			var msgAsn1 = _this.respAsn1.value[0].value[1].value[0];
			var msg = /** @type {string} */(msgAsn1.value);
			if(msgAsn1.type == _this.asnt.UTF8){
				msg = forge.util.decodeUtf8(msg);
			}
			return msg + "(" + respsts.charCodeAt(0) + ")";
		}
	}

	/**
	 * @public
	 * @param {boolean=} forP7
	 * @return {forge.asn1}
	 */
	getToken(forP7){
		/** @type {z.TsaFetcher} */
		var _this = this;
		/** @type {forge.asn1} */
		var token = _this.respAsn1.value[1];
		if(forP7){
			// create the asn1 to append to the p7 signature
			return z.createAsn1([
				z.createAsn1([
					// Attribute Type (forge.pki.oids.timeStampToken)
					z.createAsn1("1.2.840.113549.1.9.16.2.14", _this.asnt.OID),
					// Attribute Value
					z.createAsn1([token], _this.asnt.SET),
				]),
			], 1, _this.asnc.CONTEXT_SPECIFIC);
		}else{
			return token;
		}
	}

	/**
	 * @public
	 * @return {z.CertsChain}
	 */
	getCertsChain(){
		/** @type {z.TsaFetcher} */
		var _this = this;
		if(!_this.respAsn1){
			throw new Error("You must query tsa first.");
		}
		var tsdats = /** @type {Array<forge.asn1>} */(_this.respAsn1.value[1].value[1].value[0].value);
		// Get all certs in tsa token.
		/** @type {Array<forge.asn1>} */
		var certAsn1s = null;
		for(var i=3; i<tsdats.length; i++){
			/** @type {forge.asn1} */
			var tsdat = tsdats[i];
			/** @type {Object<string, *>} */
			var capt = z.parseAsn1(tsdat, {
				name: "Certs",
				tagClass: _this.asnc.CONTEXT_SPECIFIC,
				type: _this.asnt.NONE,
				constructed: true,
				capture: "certs",
			});
			if(capt){
				certAsn1s = capt.certs;
				break;
			}
		}
		if(certAsn1s){
			return new z.CertsChain(certAsn1s);
		}else{
			return null;
		}
	}

};

}

//Only for nodejs Start//
if(typeof exports === "object" && typeof module !== "undefined"){
	module.exports = supplyZgaCertsChain;
}
//Only for nodejs End//
