/** @const */
var forge = {};
forge.random = {};
/**
 * @param {number} count
 * @return {string}
 */
forge.random.getBytesSync = function(count){};

forge.util = {};
/** @constructor */
forge.util.ByteStringBuffer = function(){};
/**
 * @return {string}
 */
forge.util.ByteStringBuffer.prototype.getBytes = function(){};
/**
 * @param {string} value
 * @return {forge.util.ByteStringBuffer}
 */
forge.util.ByteStringBuffer.prototype.putBytes = function(value){};
/**
 * @param {number} i
 * @return {forge.util.ByteStringBuffer}
 */
forge.util.ByteStringBuffer.prototype.putInt16 = function(i){};
/**
 * @param {number} i
 * @return {forge.util.ByteStringBuffer}
 */
forge.util.ByteStringBuffer.prototype.putInt24Le = function(i){};
/**
 * @param {number} i
 * @return {forge.util.ByteStringBuffer}
 */
forge.util.ByteStringBuffer.prototype.putInt32Le = function(i){};
/**
 * @param {number} b
 * @param {number} n
 * @return {forge.util.ByteStringBuffer}
 */
forge.util.ByteStringBuffer.prototype.fillWithByte = function(b, n){};
/**
 * @param {number} count
 * @return {forge.util.ByteStringBuffer}
 */
forge.util.ByteStringBuffer.prototype.truncate = function(count){};
/**
 * @return {string}
 */
forge.util.ByteStringBuffer.prototype.toHex = function(){};
/** @type {string} */
forge.util.ByteStringBuffer.prototype.data;
/**
 * @param {string} input
 * @param {string=} encoding
 * @return {forge.util.ByteStringBuffer}
 */
forge.util.createBuffer = function(input, encoding){};
/**
 * @param {string} hex
 * @return {string}
 */
forge.util.hexToBytes = function(hex){};
/**
 * @param {string=} value
 * @return {string}
 */
forge.util.decodeUtf8 = function(value){};

/** @constructor */
forge.asn1 = function(){};
/**
 * @typedef
 * {{
 *    strict: (boolean|undefined),
 *    parseAllBytes: (boolean|undefined),
 *    decodeBitStrings: (boolean|undefined),
 * }}
 */
var DerOption;
/**
 * @param {forge.util.ByteStringBuffer|string} bytes
 * @param {DerOption=} options
 * @return {forge.asn1}
 */
forge.asn1.fromDer = function(bytes, options){};
/**
 * @param {forge.asn1} obj
 * @return {forge.util.ByteStringBuffer}
 */
forge.asn1.toDer = function(obj){};
/**
 * @param {number} num
 * @return {forge.util.ByteStringBuffer}
 */
forge.asn1.integerToDer = function(num){};
/**
 * @param {string} oid
 * @return {forge.util.ByteStringBuffer}
 */
forge.asn1.oidToDer = function(oid){};
forge.asn1.Type = {};
/** @type {number} */
forge.asn1.Type.UTF8;
/** @type {number} */
forge.asn1.Type.SET;
/** @type {number} */
forge.asn1.Type.SEQUENCE;
/** @type {number} */
forge.asn1.Type.BOOLEAN;
/** @type {number} */
forge.asn1.Type.INTEGER;
/** @type {number} */
forge.asn1.Type.OID;
/** @type {number} */
forge.asn1.Type.NULL;
/** @type {number} */
forge.asn1.Type.OCTETSTRING;
forge.asn1.Class = {};
/** @type {string} */
forge.asn1.Class.UNIVERSAL;
/**
 * @param {string} tagClass
 * @param {number} type
 * @param {boolean} constructed
 * @param {Array<string>} value
 * @param {Object=} options
 * @return {forge.asn1}
 */
forge.asn1.create = function(tagClass, type, constructed, value, options){};
/** @type {Array<forge.asn1>} */
forge.asn1.prototype.value;

/** @constructor */
const forge_BigInteger = function(){};
/**
 * @param {forge_BigInteger} a
 * @return {number}
 */
forge_BigInteger.prototype.compareTo = function(a){};
/** @constructor */
const forge_cert = function(){};
/** @type {forge_key} */
forge_cert.prototype.publicKey;
/** @type {forge_cert_issuer} */
forge_cert.prototype.issuer;
/** @constructor */
const forge_key = function(){};
/** @type {forge_BigInteger} */
forge_key.prototype.n;
/** @type {forge_BigInteger} */
forge_key.prototype.e;
/** @constructor */
const forge_cert_issuer = function(){};
/** @type {Array<forge_cert_attr>} */
forge_cert_issuer.prototype.attributes;
/**
 * @typedef
 * {{
 *    valueTagClass: (number|undefined),
 *    type: (string|undefined),
 *    value: (string|undefined),
 * }}
 */
var forge_cert_attr;
/**
 * @typedef
 * {{
 *    key: (forge_key|undefined),
 *    certificate: (forge_cert|undefined),
 *    digestAlgorithm: (string|undefined),
 *    authenticatedAttributes: (Array<forge_cert_attr>|undefined),
 *    unauthenticatedAttributes: (Array<forge_cert_attr>|undefined),
 *    signature: (string|undefined),
 * }}
 */
var forge_signer;

/** @constructor */
forge.pkcs7 = function(){};
/**
 * @return {forge.pkcs7}
 */
forge.pkcs7.createSignedData = function(){};
/**
 * @return {forge.pkcs7}
 */
forge.pkcs7.createEnvelopedData = function(){};
/**
 * @param {forge_cert} cert
 */
forge.pkcs7.prototype.addCertificate = function(cert){};
/**
 * @param {forge_signer} signer
 */
forge.pkcs7.prototype.addSigner = function(signer){};
/** @type {Array<forge_signer>} */
forge.pkcs7.prototype.signers;
/** @type {Array<forge.asn1>} */
forge.pkcs7.prototype.signerInfos;
/**
 * @param {forge_cert} cert
 */
forge.pkcs7.prototype.addRecipient = function(cert){};
/** @type {forge.util.ByteStringBuffer} */
forge.pkcs7.prototype.content;
/**
 * @param {forge.util.ByteStringBuffer=} key
 * @param {string=} cipher
 */
forge.pkcs7.prototype.encrypt = function(key, cipher){};
/**
 * @typedef
 * {{
 *    detached: (boolean|undefined),
 * }}
 */
var forge_sign_option;
/**
 * @param {forge_sign_option} options
 */
forge.pkcs7.prototype.sign = function(options){};
/**
 * @return {forge.asn1}
 */
forge.pkcs7.prototype.toAsn1 = function(){};

/** @constructor */
forge.pkcs12 = function(){};
/**
 * @param {forge.asn1} obj
 * @param {boolean=} strict
 * @param {string=} password
 * @return {forge.pkcs12}
 */
forge.pkcs12.pkcs12FromAsn1 = function(obj, strict, password){};
/**
 * @typedef
 * {{
 *    localKeyId: (string|undefined),
 *    localKeyIdHex: (string|undefined),
 *    friendlyName: (string|undefined),
 *    bagType: (string|undefined),
 * }}
 */
var P12BagsFilter;
/**
 * @typedef
 * {{
 *    cert: forge_cert,
 *    key: forge_key,
 * }}
 */
var P12Bag;
/**
 * @param {P12BagsFilter} filter
 * @return {Object<string, Object<string|number, P12Bag>>}
 */
forge.pkcs12.prototype.getBags = function(filter){};

forge.oids = {};
/** @type {string} */
forge.oids.sha256;
forge.pki = {};
forge.pki.oids = {};
/** @type {string} */
forge.pki.oids.certBag;
/** @type {string} */
forge.pki.oids.pkcs8ShroudedKeyBag;
/** @type {string} */
forge.pki.oids.sha256;
/** @type {string} */
forge.pki.oids.contentType;
/** @type {string} */
forge.pki.oids.data;
/** @type {string} */
forge.pki.oids.messageDigest;
/** @type {string} */
forge.pki.oids.signingTime;
/**
 * @param {forge.asn1} obj
 * @param {boolean=} computeHash
 * @return {forge_cert}
 */
forge.pki.certificateFromAsn1 = function(obj, computeHash){};

forge.md = {};
/** @constructor */
forge.md.digest = function(){};
/**
 * @param {string=} msg
 * @param {string=} encoding
 * @return {forge.md.digest}
 */
forge.md.digest.prototype.update = function(msg, encoding){};
/**
 * @return {forge.util.ByteStringBuffer}
 */
forge.md.digest.prototype.digest = function(){};
forge.md.md5 = {};
forge.md.sha1 = {};
forge.md.sha256 = {};
/**
 * @return {forge.md.digest}
 */
forge.md.md5.create = function(){};
/**
 * @return {forge.md.digest}
 */
forge.md.sha1.create = function(){};
/**
 * @return {forge.md.digest}
 */
forge.md.sha256.create = function(){};

forge.cipher = {};
/** @constructor */
forge.cipher.BlockCipher = function(){};
/**
 * @typedef
 * {{
 *    iv: (string|undefined),
 *    additionalData: (string|undefined),
 *    tagLength: (number|undefined),
 *    tag: (string|undefined),
 *    output: (forge.util.ByteStringBuffer|undefined),
 * }}
 */
var CipherOptions;
/**
 * @param {CipherOptions} options
 */
forge.cipher.BlockCipher.prototype.start = function(options){};
/**
 * @param {forge.util.ByteStringBuffer} input
 */
forge.cipher.BlockCipher.prototype.update = function(input){};
/**
 * @return {boolean}
 */
forge.cipher.BlockCipher.prototype.finish = function(){};
/** @type {forge.util.ByteStringBuffer} */
forge.cipher.BlockCipher.prototype.output;
/**
 * @param {string} algorithm
 * @param {forge.util.ByteStringBuffer} key
 * @return {forge.cipher.BlockCipher}
 */
forge.cipher.createCipher = function(algorithm, key) {};
