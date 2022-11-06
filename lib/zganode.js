const m_urlparser = require("url");
const m_h = {
	"http:": require("http"),
	"https:": require("https"),
};
const z = require("./zgaindex.js");
z.forge = require("node-forge");
z.PDFLib = require("pdf-lib");
/**
 * @param {string} url
 * @param {UrlFetchParams} params
 * @return {Promise<Uint8Array>}
 */
z.urlFetch = function(url, params){
	return new Promise(function(resolve, reject){
		/** @type {URL} */
		var opts = m_urlparser.parse(url);
		var http = m_h[opts.protocol];
		/** @type {string|Buffer} */
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

require("./zgacertsutil.js")(z);
require("./zgapdfcryptor.js")(z);
require("./zgapdfsigner.js")(z);
module.exports = z;
