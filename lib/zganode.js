const m_urlparser = require("url");
const m_h = {
	"http:": require('follow-redirects').http,
	"https:": require('follow-redirects').https,
};
const z = require("./zgaindex.js");
z.forge = require("node-forge");
z.PDFLib = require("pdf-lib");
// z.fontkit = require("@pdf-lib/fontkit");
z.fontkit = require("pdf-fontkit");
z.pako = require("pako");

require("./zgafetch.js")(z);
require("./zgacertsutil.js")(z);
require("./zgapdfcryptor.js")(z);
require("./zgapdfsigner.js")(z);
module.exports = z;
