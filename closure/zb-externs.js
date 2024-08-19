/**
 * @typedef
 * {{
 *    url: string,
 *    len: (number|undefined),
 *    headers: (Object<string, *>|undefined),
 * }}
 */
var TsaServiceInfo;
/**
 * the base point of x, y is top left corner.
 * wDraw, hDraw: Only for internal process.
 * @typedef
 * {{
 *    x: number,
 *    y: number,
 *    w: (number|undefined),
 *    h: (number|undefined),
 *    wDraw: (number|undefined),
 *    hDraw: (number|undefined),
 * }}
 */
var SignAreaInfo;
/**
 * fontData:   default: StandardFonts.Helvetica
 * color:      A Hex string of color. default: #000
 * opacity:    valid value is from 0 to 1. default: 1 // Not implemented
 * blendMode:  https://pdf-lib.js.org/docs/api/enums/blendmode // Not implemented
 * lineHeight: default is the height of the font at the given size
 * xOffset:    An offset from SignAreaInfo's x
 * yOffset:    An offset from SignAreaInfo's y
 * align:      Text alignment: 0 left, 1 center, 2 right. default: 0
 * noBreaks:   A regular expression string that indicates which characters should not be used to break a word. default: [A-Za-z0-9]
 *
 * @typedef
 * {{
 *    text: string,
 *    fontData: (Array<number>|Uint8Array|ArrayBuffer|string|undefined),
 *    subset: (boolean|undefined),
 *    color: (string|undefined),
 *    opacity: (number|undefined),
 *    blendMode: (string|undefined),
 *    lineHeight: (number|undefined),
 *    size: number,
 *    xOffset: (number|undefined),
 *    yOffset: (number|undefined),
 *    wMax: (number|undefined),
 *    align: (number|undefined),
 *    noBreaks: (string|undefined),
 * }}
 */
var SignTextInfo;
/**
 * opacity:    valid value is from 0 to 1. default: 1 // Not implemented
 * blendMode:  https://pdf-lib.js.org/docs/api/enums/blendmode // Not implemented
 *
 * @typedef
 * {{
 *    imgData: (Array<number>|Uint8Array|ArrayBuffer|string|undefined),
 *    imgType: (string|undefined),
 *    opacity: (number|undefined),
 *    blendMode: (string|undefined),
 * }}
 */
var SignImageInfo;
/**
 * The signature can be placed in the same position on multiple pages, but all pages must have the same size and rotation angle.
 * pageidx: Can be a string to indicate placing the signature on multiple pages.
 *   For example: A pdf contains 17 pages and specify "-3,5-7,9,12,15-" means [0,1,2,3,5,6,7,9,12,15,16]
 * imgData, imgType: Deprecated, use imgInfo instead.
 * img, font: Only for internal process.
 *
 * @typedef
 * {{
 *    area: SignAreaInfo,
 *    pageidx: (number|string|undefined),
 *    imgData: (Array<number>|Uint8Array|ArrayBuffer|string|undefined),
 *    imgType: (string|undefined),
 *    imgInfo: (SignImageInfo|undefined),
 *    textInfo: (SignTextInfo|undefined),
 *    img: (PDFLib.PDFImage|undefined),
 *    font: (PDFLib.PDFFont|undefined),
 * }}
 */
var SignDrawInfo;
/**
 * In the case of adding a document timestamp, the p12cert and pwd must be omitted. But meanwhile the tsa must be provided.
 * 
 * permission: (DocMDP) The modification permissions granted for this document. Valid values are:
 *  1 : No changes to the document are permitted; any change to the document invalidates the signature.
 *  2 : Permitted changes are filling in forms, instantiating page templates, and signing; other changes invalidate the signature.
 *  3 : Permitted changes are the same as for 2, as well as annotation creation, deletion, and modification; other changes invalidate the signature.
 *
 * ltv: Type of Long-Term Validation. Valid values are:
 *  1 : auto; Try using ocsp only to enable the LTV first; If can't, try using crl to enable the LTV.
 *  2 : crl only; Only try using crl to enable the LTV.
 *
 * @typedef
 * {{
 *    p12cert: (Array<number>|Uint8Array|ArrayBuffer|string|undefined),
 *    pwd: (string|undefined),
 *    permission: (number|undefined),
 *    reason: (string|undefined),
 *    location: (string|undefined),
 *    contact: (string|undefined),
 *    signdate: (Date|TsaServiceInfo|string|undefined),
 *    signame: (string|undefined),
 *    drawinf: (SignDrawInfo|undefined),
 *    ltv: (number|undefined),
 *    debug: (boolean|undefined),
 * }}
 */
var SignOption;

/**
 * @typedef
 * {{
 *    c: (Array<number>|Uint8Array|ArrayBuffer|string|forge_cert|undefined),
 *    p: (Array<string>|undefined),
 * }}
 */
var PubKeyInfo;
/**
 * permissions: The set of permissions (specify the ones you want to block):
 *  copy : (Only valid on public-key mode) Copy text and graphics from the document;
 *  print : Print the document;
 *  modify : Modify the contents of the document by operations other than those controlled by 'fill-forms', 'extract' and 'assemble';
 *  copy-extract : Copy or otherwise extract text and graphics from the document;
 *  annot-forms : Add or modify text annotations, fill in interactive form fields, and, if 'modify' is also set, create or modify interactive form fields (including signature fields);
 *  fill-forms : Fill in existing interactive form fields (including signature fields), even if 'annot-forms' is not specified;
 *  extract : Extract text and graphics (in support of accessibility to users with disabilities or for other purposes);
 *  assemble : Assemble the document (insert, rotate, or delete pages and create bookmarks or thumbnail images), even if 'modify' is not set;
 *  print-high : Print the document to a representation from which a faithful digital copy of the PDF content could be generated. When this is not set, printing is limited to a low-level representation of the appearance, possibly of degraded quality.
 *
 * ownerpwd: Owner password If not specified, a random value is used.
 *
 * pubkeys: Array of recipients containing public-key certificates ('c') and permissions ('p'). If want to encrypt the pdf by the certificate of signing, just apply a PubKeyInfo without c.
 *
 * @typedef
 * {{
 *    mode: Zga.Crypto.Mode,
 *    permissions: (Array<string>|undefined),
 *    userpwd: (string|undefined),
 *    ownerpwd: (string|undefined),
 *    pubkeys: (Array<PubKeyInfo>|undefined),
 * }}
 */
var EncryptOption;
/**
 * @typedef
 * {{
 *    CFM: string,
 *    Length: (number|undefined),
 *    EncryptMetadata: (boolean|undefined),
 *    AuthEvent: (string|undefined),
 * }}
 */
var CFType;
/**
 * enckey: Last RC4 key encrypted.
 * enckeyc: Last RC4 computed key.
 * @typedef
 * {{
 *    enckey: string,
 *    enckeyc: Array<number>,
 * }}
 */
var RC4LastInfo;
/**
 * @typedef
 * {{
 *    certs: (Array<forge_cert>|undefined),
 *    ocsps: (Array<Uint8Array>|undefined),
 *    crls: (Array<Uint8Array>|undefined),
 * }}
 */
var DSSInfo;
/**
 * @typedef
 * {{
 *    resp: (Uint8Array|undefined),
 *    cchainIdx: (number|undefined),
 * }}
 */
var OcspData;

var Zga = {};
/**
 * @param {Uint8Array} uarr
 * @return {string}
 */
Zga.u8arrToRaw = function(uarr){};
/**
 * @param {string} raw
 * @return {Uint8Array}
 */
Zga.rawToU8arr = function(raw){};

Zga.Crypto = {};
/** @enum {number} */
Zga.Crypto.Mode = {
	RC4_40: 0,
	RC4_128: 1,
	AES_128: 2,
	AES_256: 3,
};
/**
 * @constructor
 * @param {EncryptOption} encopt
 */
Zga.PdfCryptor = function(encopt){};
/**
 * @param {PDFLib.PDFDocument|Array<number>|Uint8Array|ArrayBuffer|string} pdf
 * @param {PDFLib.PDFRef=} ref
 * @return {Promise<PDFLib.PDFDocument>}
 */
Zga.PdfCryptor.prototype.encryptPdf = function(pdf, ref){};
/**
 * @param {number} num
 * @param {PDFLib.PDFObject} val
 */
Zga.PdfCryptor.prototype.encryptObject = function(num, val){};
/**
 * @constructor
 * @param {Array<forge_cert|forge.asn1|string>=} certs
 */
Zga.CertsChain = function(certs){};
/**
 * @return {forge_cert}
 */
Zga.CertsChain.prototype.getSignCert = function(){};
/**
 * @public
 * @return {boolean}
 */
Zga.CertsChain.prototype.isSelfSignedCert = function(){};
/**
 * @return {Array<forge_cert>}
 */
Zga.CertsChain.prototype.getAllCerts = function(){};
/**
 * @public
 * @param {forge_cert} cert
 * @return {Promise<boolean>}
 */
Zga.CertsChain.prototype.buildChain = function(cert){};
/**
 * @param {boolean=} crlOnly
 * @return {Promise<DSSInfo>}
 */
Zga.CertsChain.prototype.prepareDSSInf = function(crlOnly){};
/**
 * @constructor
 * @param {TsaServiceInfo} inf
 */
Zga.TsaFetcher = function(inf){};
/** @type {string} */
Zga.TsaFetcher.prototype.url;
/** @type {number} */
Zga.TsaFetcher.prototype.len;
/**
 * @param {string=} data
 * @return {Promise<string>}
 */
Zga.TsaFetcher.prototype.queryTsa = function(data){};
/**
 * @param {boolean=} forP7
 * @return {forge.asn1}
 */
Zga.TsaFetcher.prototype.getToken = function(forP7){};
/**
 * @return {Zga.CertsChain}
 */
Zga.TsaFetcher.prototype.getCertsChain = function(){};

/**
 * @constructor
 * @param {SignOption} signopt
 */
Zga.PdfSigner = function(signopt){};
/**
 * @public
 * @param {PDFLib.PDFDocument|Array<number>|Uint8Array|ArrayBuffer|string} pdf
 * @param {EncryptOption=} cypopt
 * @return {Promise<Uint8Array>}
 */
Zga.PdfSigner.prototype.sign = function(pdf, cypopt){};
