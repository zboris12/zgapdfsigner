/**
 * @typedef
 * {{
 *    contentType: (string|undefined),
 *    headers: (Object<string, *>|undefined),
 *    method: (string|undefined),
 *    payload: (string|Uint8Array|undefined),
 *    useIntranet: (boolean|undefined),
 *    validateHttpsCertificates: (boolean|undefined),
 *    followRedirects: (boolean|undefined),
 *    muteHttpExceptions: (boolean|undefined),
 *    escaping: (boolean|undefined),
 * }}
 */
var UrlFetchParams;

/**
 * @constructor
 */
function GoogleUrlFetchApp(){}
/**
 * @param {string} url
 * @param {UrlFetchParams} params
 * @return {HTTPResponse}
 */
GoogleUrlFetchApp.prototype.fetch = function(url, params){};

/**
 * @const {!GoogleUrlFetchApp}
 */
var UrlFetchApp;

/**
 * @constructor
 */
function HTTPResponse(){}
/**
 * @return {GBlob}
 */
HTTPResponse.prototype.getBlob = function(){};

/**
 * @constructor
 */
function GBlob(){}
/**
 * @return {Array<number>}
 */
GBlob.prototype.getBytes = function(){};

