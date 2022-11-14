'use strict';

/**
 * @return {Object<string, *>}
 */
function genZga(){
	/** @const {Object<string, *>} */
	const z = {};

	/**
	 * @param {string} msg
	 */
	z.log = function(msg){
		if(z.debug){
			console.log(msg);
		}
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

	// Google Apps Script
	if(globalThis.UrlFetchApp){
		/**
		 * @param {string} url
		 * @param {UrlFetchParams} params
		 * @return {Promise<Uint8Array>}
		 */
		z.urlFetch = function(url, params){
			return new Promise(function(resolve){
				/** @type {GBlob} */
				var tblob = UrlFetchApp.fetch(url, params).getBlob();
				resolve(new Uint8Array(tblob.getBytes()));
			});
		};
	}

	return z;
}

//Only for nodejs Start//
if(typeof exports === "object" && typeof module !== "undefined"){
	module.exports = genZga();
}else{
//Only for nodejs End//
	if(!globalThis.Zga){
		globalThis.Zga = genZga();
		supplyZgaCertsChain(globalThis.Zga);
		supplyZgaCryptor(globalThis.Zga);
		supplyZgaSigner(globalThis.Zga);
	}
//Only for nodejs Start//
}
//Only for nodejs End//
