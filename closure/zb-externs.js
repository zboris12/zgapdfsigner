/**
 * @typedef
 * {{
 *    url: string,
 *    len: (number|undefined),
 * }}
 */
var TsaServiceInfo;
/**
 * the base point of x, y is top left corner.
 * @typedef
 * {{
 *    x: number,
 *    y: number,
 *    w: number,
 *    h: number,
 * }}
 */
var SignAreaInfo;
/**
 * @typedef
 * {{
 *    area: SignAreaInfo,
 *    pageidx: (number|undefined),
 *    imgData: (Array<number>|Uint8Array|ArrayBuffer|string|undefined),
 *    imgType: (string|undefined),
 *    text: (string|undefined),
 *    fontData: (PDFLib.StandardFonts|Array<number>|Uint8Array|ArrayBuffer|string|undefined),
 *    img: (PDFLib.PDFImage|undefined),
 *    font: (PDFLib.PDFFont|undefined),
 * }}
 */
var SignDrawInfo;
/**
 * permission: (DocMDP) The modification permissions granted for this document. Valid values are:
 *  1 : No changes to the document are permitted; any change to the document invalidates the signature.
 *  2 : Permitted changes are filling in forms, instantiating page templates, and signing; other changes invalidate the signature.
 *  3 : Permitted changes are the same as for 2, as well as annotation creation, deletion, and modification; other changes invalidate the signature.
 *
 * @typedef
 * {{
 *    p12cert: (Array<number>|Uint8Array|ArrayBuffer|string),
 *    pwd: string,
 *    permission: (number|undefined),
 *    reason: (string|undefined),
 *    location: (string|undefined),
 *    contact: (string|undefined),
 *    signdate: (Date|TsaServiceInfo|string|undefined),
 *    signame: (string|undefined),
 *    drawinf: (SignDrawInfo|undefined),
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
