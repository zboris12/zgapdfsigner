/**
 * @typedef
 * {{
 *    ignoreEncryption: (boolean|undefined),
 *    parseSpeed: (number|undefined),
 *    throwOnInvalidObject: (boolean|undefined),
 * }}
 */
var PdfLoadOptions;

/** @const */
var PDFLib = {};

/** @constructor */
PDFLib.PDFDocument = function(){};
/**
 * @param {string|Uint8Array|ArrayBuffer} pdf
 * @param {PdfLoadOptions=} options
 * @return {PDFLib.PDFDocument}
 */
PDFLib.PDFDocument.load = function(pdf, options){};
/**
 * @typedef
 * {{
 *    useObjectStreams: (boolean|undefined),
 *    addDefaultPage: (boolean|undefined),
 *    objectsPerTick: (number|undefined),
 * }}
 */
var PdfSaveOptions;
/**
 * @param {PdfSaveOptions} options
 * @returns {Promise<Uint8Array>}
 */
PDFLib.PDFDocument.prototype.save = function(options){};
/**
 * @returns {Array<PDFLib.PDFPage>}
 */
PDFLib.PDFDocument.prototype.getPages = function(){};
/**
 * @param {ArrayBuffer|Uint8Array|string} png
 * @returns {Promise<PDFLib.PDFImage>}
 */
PDFLib.PDFDocument.prototype.embedPng = function(png){};
/**
 * @param {ArrayBuffer|Uint8Array|string} jpg
 * @returns {Promise<PDFLib.PDFImage>}
 */
PDFLib.PDFDocument.prototype.embedJpg = function(jpg){};
/**
 * @returns {Promise<number>}
 */
PDFLib.PDFDocument.prototype.flush = function(){};
/** @type {PDFLib.PDFCatalog} */
PDFLib.PDFDocument.prototype.catalog;
/** @type {PDFLib.PDFContext} */
PDFLib.PDFDocument.prototype.context;

/** @constructor */
PDFLib.PDFCatalog = function(){};
/**
 * @param {PDFLib.PDFName} name
 * @param {PDFLib.PDFObject} object
 */
PDFLib.PDFCatalog.prototype.set = function(name, object){};

/** @constructor */
PDFLib.PDFPage = function(){};
/** @type {PDFLib.PDFRef} */
PDFLib.PDFPage.prototype.ref;
/** @type {PDFLib.PDFPageLeaf} */
PDFLib.PDFPage.prototype.node;
/**
 * @return {PDFLib.Rotation}
 */
PDFLib.PDFPage.prototype.getRotation = function(){};
/**
 * @typedef
 * {{
 *    width: number,
 *    height: number,
 * }}
 */
var PdfSize;
/**
 * @return {PdfSize}
 */
PDFLib.PDFPage.prototype.getSize = function(){};

/** @constructor */
PDFLib.PDFPageLeaf = function(){};
/**
 * @param {PDFLib.PDFName} name
 * @param {PDFLib.PDFObject} object
 */
PDFLib.PDFPageLeaf.prototype.set = function(name, object){};

/** @constructor */
PDFLib.PDFRef = function(){};
/** @type {number} */
PDFLib.PDFRef.prototype.objectNumber;
/** @type {number} */
PDFLib.PDFRef.prototype.generationNumber;
/**
 * @param {number} objectNumber
 * @param {number=} generationNumber
 * @return {PDFLib.PDFRef}
 */
PDFLib.PDFRef.of = function(objectNumber, generationNumber){};

/** @constructor */
PDFLib.PDFContext = function(){};
/**
 * @typedef
 * {{
 *    0: PDFLib.PDFRef,
 *    1: PDFLib.PDFObject,
 * }}
 */
var PdfObjEntry;
/** @return {Array<PdfObjEntry>} */
PDFLib.PDFContext.prototype.enumerateIndirectObjects = function(){};
/**
 * @typedef
 * {{
 *    Root: PDFLib.PDFRef,
 *    ID: (PDFLib.PDFArray|undefined),
 * }}
 */
var PdfTrailerInfo;
/** @type {PdfTrailerInfo} */
PDFLib.PDFContext.prototype.trailerInfo;
/**
 * @param {PDFLib.PDFRef} ref
 * @param {PDFLib.PDFObject} object
 */
PDFLib.PDFContext.prototype.assign = function(ref, object){};
/**
 * @param {PDFLib.PDFObject} object
 * @return {PDFLib.PDFRef}
 */
PDFLib.PDFContext.prototype.register = function(object){};
/**
 * @return {PDFLib.PDFRef}
 */
PDFLib.PDFContext.prototype.nextRef = function(){};
/**
 * @param {*} literal
 * @return {PDFLib.PDFObject}
 */
PDFLib.PDFContext.prototype.obj = function(literal){};
/**
 * @param {PDFLib.PDFRef} ref
 * @return {PDFLib.PDFObject}
 */
PDFLib.PDFContext.prototype.lookup = function(ref){};

/** @constructor */
PDFLib.PDFObject = function(){};
/** @type {Map<PDFLib.PDFRef, PDFLib.PDFObject>} */
PDFLib.PDFObject.prototype.dict;
/** @type {Array<PDFLib.PDFName>} */
PDFLib.PDFObject.prototype.array;

/**
 * @constructor
 * @extends {PDFLib.PDFObject}
 */
PDFLib.PDFName = function(){};
/**
 * @param {string} value
 * @return {PDFLib.PDFName}
 */
PDFLib.PDFName.of = function(value){};
/** @type {string} */
PDFLib.PDFName.prototype.encodedName;
/** @type {number} */
PDFLib.PDFName.prototype.numberValue;

/**
 * @constructor
 * @param {PDFLib.PDFContext} context
 */
PDFLib.PDFArray = function(context){};
/**
 * @param {PDFLib.PDFObject} object
 */
PDFLib.PDFArray.prototype.push = function(object){};
/**
 * @param {number} idx
 * @return {PDFLib.PDFObject}
 */
PDFLib.PDFArray.prototype.get = function(idx){};

/**
 * @constructor
 * @extends {PDFLib.PDFObject}
 */
PDFLib.PDFString = function(){};
/**
 * @param {string} value
 * @return {PDFLib.PDFString}
 */
PDFLib.PDFString.of = function(value){};
/**
 * @param {Date} value
 * @return {PDFLib.PDFString}
 */
PDFLib.PDFString.fromDate = function(value){};

/**
 * @constructor
 * @extends {PDFLib.PDFObject}
 */
PDFLib.PDFHexString = function(){};
/**
 * @param {string} value
 * @return {PDFLib.PDFHexString}
 */
PDFLib.PDFHexString.of = function(value){};
/**
 * @param {string} value
 * @return {PDFLib.PDFHexString}
 */
PDFLib.PDFHexString.fromText = function(value){};

/**
 * @constructor
 * @extends {PDFLib.PDFObject}
 */
PDFLib.PDFNumber = function(){};
/**
 * @param {number} value
 * @return {PDFLib.PDFNumber}
 */
PDFLib.PDFNumber.of = function(value){};

/** @constructor */
PDFLib.PDFImage = function(){};
/**
 * @return {PdfSize}
 */
PDFLib.PDFImage.prototype.size = function(){};
/** @type {PDFLib.PDFRef} */
PDFLib.PDFImage.prototype.ref;

/** @constructor */
PDFLib.PDFFont = function(){};
/** @type {PDFLib.PDFRef} */
PDFLib.PDFFont.prototype.ref;
/** @constructor */
PDFLib.StandardFonts = function(){};

PDFLib.RotationTypes = {};
/** @type {string} */
PDFLib.RotationTypes.Degrees;
/** @constructor */
PDFLib.Rotation = function(){};
/** @type {string} */
PDFLib.Rotation.prototype.type;
/**
 * @param {number} d
 * @return {PDFLib.Rotation}
 */
PDFLib.degrees = function(d){};
/**
 * @param {PDFLib.Rotation} rot
 * @return {PDFLib.Rotation}
 */
PDFLib.toDegrees = function(rot){};

/** @constructor */
PDFLib.PDFOperator = function(){};
/**
 * @typedef
 * {{
 *    x: (number|undefined),
 *    y: (number|undefined),
 *    width: (number|undefined),
 *    height: (number|undefined),
 *    rotate: (PDFLib.Rotation|undefined),
 *    xSkew: (PDFLib.Rotation|undefined),
 *    ySkew: (PDFLib.Rotation|undefined),
 * }}
 */
var PdfDrawimgOption;
/**
 * @param {string} name
 * @param {PdfDrawimgOption} options
 */
PDFLib.drawImage = function(name, options){};

/**
 * @constructor
 */
PDFLib.Cache = function(){};
/**
 * @return {Uint8Array}
 */
PDFLib.Cache.prototype.access = function(){};
/** @type {Uint8Array} */
PDFLib.Cache.prototype.value;
/**
 * @constructor
 * @extends {PDFLib.PDFObject}
 */
PDFLib.PDFStream = function(){};
/**
 * @constructor
 * @extends {PDFLib.PDFStream}
 */
PDFLib.PDFFlateStream = function(){};
/** @type {PDFLib.Cache} */
PDFLib.PDFFlateStream.prototype.contentsCache;
/**
 * @constructor
 * @extends {PDFLib.PDFFlateStream}
 */
PDFLib.PDFContentStream = function(){};
/**
 * @param {PDFLib.PDFObject} dict
 * @param {Array<PDFLib.PDFOperator>} operators
 * @param {boolean=} encode
 * @return {PDFLib.PDFContentStream}
 */
PDFLib.PDFContentStream.of = function(dict, operators, encode){};
