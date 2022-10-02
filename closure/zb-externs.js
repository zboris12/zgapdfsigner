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
 * @typedef
 * {{
 *    p12cert: (Array<number>|Uint8Array|ArrayBuffer|string),
 *    pwd: string,
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
 *    c: string,
 *    p: (Array<Zga.Crypto.Permission>|undefined),
 * }}
 */
var PubKeyInfo;
/**
 * permissions: The set of permissions (specify the ones you want to block):
 *  print : Print the document;
 *  modify : Modify the contents of the document by operations other than those controlled by 'fill-forms', 'extract' and 'assemble';
 *  copy : Copy or otherwise extract text and graphics from the document;
 *  annot-forms : Add or modify text annotations, fill in interactive form fields, and, if 'modify' is also set, create or modify interactive form fields (including signature fields);
 *  fill-forms : Fill in existing interactive form fields (including signature fields), even if 'annot-forms' is not specified;
 *  extract : Extract text and graphics (in support of accessibility to users with disabilities or for other purposes);
 *  assemble : Assemble the document (insert, rotate, or delete pages and create bookmarks or thumbnail images), even if 'modify' is not set;
 *  print-high : Print the document to a representation from which a faithful digital copy of the PDF content could be generated. When this is not set, printing is limited to a low-level representation of the appearance, possibly of degraded quality.
 *  owner : (inverted logic - only for public-key) when set permits change of encryption and enables all other permissions.
 *
 * ownerpwd: Owner password If not specified, a random value is used.
 *
 * pubkeys: Array of recipients containing public-key certificates ('c') and permissions ('p').
 *
 * @typedef
 * {{
 *    mode: Zga.Crypto.Mode,
 *    permissions: (Array<Zga.Crypto.Permission>|undefined),
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
