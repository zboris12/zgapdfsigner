/**
 * @param {Object<string, *>} z
 */
function supplyZgaUrlFetch(z){

//Only for nodejs Start//
const m_urlparser = require("url");
const m_h = {
	"http:": require('follow-redirects').http,
	"https:": require('follow-redirects').https,
};
// @type {boolean}
z.isNode = function(){return this === globalThis.global;}();
//Only for nodejs End//

/** @type {boolean} */
z.isBrowser = function(){return this === globalThis.self;}();

/**
 * @param {string} url
 * @param {UrlFetchParams} params
 * @return {Promise<Uint8Array>}
 */
z.urlFetch = function(url, params){

//Only for nodejs Start//
	if(z.isNode){
		return new Promise(function(resolve, reject){
			// @type {URL}
			var opts = m_urlparser.parse(url);
			var http = m_h[opts.protocol];
			// @type {string|Buffer}
			var dat = null;
			var encoding = undefined;
			opts.method = "GET";
			if(params){
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
			}

			// @type {http.ClientRequest}
			var hreq = http.request(opts, function(a_res){ // @type {http.IncomingMessage} a_res
				if(a_res.statusCode !== 200){
					var a_err = new Error("Failed to request url. " + url +  "\n Status Code: " + a_res.statusCode);
					a_res.resume();
					throw a_err;
				}
				// @type {Array<Buffer>}
				var a_bufs = [];
				var a_bufs_len = 0;
				a_res.on("data", function(b_chunk){ // @type {Buffer} b_chunk
					a_bufs.push(b_chunk);
					a_bufs_len += b_chunk.length;
				});
				a_res.on("end", function(){
					// @type {Buffer}
					var b_bdat = Buffer.concat(a_bufs, a_bufs_len);
					resolve(b_bdat);
				});
			});
			hreq.on("error", function(a_err){
				throw a_err;
			});
			hreq.end(dat, encoding);
		});
	}
//Only for nodejs End//

	// Google Apps Script
	if(globalThis.UrlFetchApp){
		return new Promise(function(resolve){
			/** @type {GBlob} */
			var tblob = UrlFetchApp.fetch(url, params).getBlob();
			resolve(new Uint8Array(tblob.getBytes()));
		});
	}

	// browser
	if(z.isBrowser && globalThis.self.fetch){
		/**
		 * @return {Promise<Uint8Array>}
		 */
		var func = async function(){
			/** @type {!RequestInit} */
			var reqinf = {
				method: "GET",
				redirect: "follow",
			};
			if(params){
				if(params.payload){
					reqinf.body = params.payload;
				}
				if(params.headers){
					reqinf.headers = params.headers;
				}
				if(params.method){
					reqinf.method = params.method;
				}
			}
			/** @type {Response} */
			var resp = await fetch(url, reqinf);
			if(resp.ok){
				/** @type {ArrayBuffer} */
				var abdat = await resp.arrayBuffer();
				return new Uint8Array(abdat);
			}else{
				/** @type {string} */
				var msg = await resp.text();
				throw new Error("Fetch failed." + resp.status + ": " + msg);
			}
		};
		return func();
	}
	return null;
};

}

//Only for nodejs Start//
if(typeof exports === "object" && typeof module !== "undefined"){
	module.exports = supplyZgaUrlFetch;
}
//Only for nodejs End//
