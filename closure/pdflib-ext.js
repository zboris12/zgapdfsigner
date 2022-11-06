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

/**
 * @param {string} str
 * @param {Array<number>} buffer
 * @param {number} offset
 * @return {number}
 */
PDFLib.copyStringIntoBuffer = function(str, buffer, offset){};
/**
 * @param {string|ArrayBuffer|Uint8Array} input
 * @return {Uint8Array}
 */
PDFLib.toUint8Array = function(input){};

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
PDFLib.PDFAcroField = function(){};
/**
 * @returns {PDFLib.PDFString|PDFLib.PDFHexString}
 */
PDFLib.PDFAcroField.prototype.T = function(){};

/**
 * @constructor
 * @extends {PDFLib.PDFAcroField}
 */
PDFLib.PDFAcroTerminal = function(){};
/**
 * @constructor
 * @extends {PDFLib.PDFAcroTerminal}
 */
PDFLib.PDFAcroSignature = function(){};

/** @constructor */
PDFLib.PDFAcroForm = function(){};
/**
 * @typedef
 * {{
 *    0: PDFLib.PDFAcroField,
 *    1: PDFLib.PDFRef,
 * }}
 */
var PdfFieldInfo;
/**
 * @return {Array<PdfFieldInfo>}
 */
PDFLib.PDFAcroForm.prototype.getAllFields = function(){};
/**
 * @param {PDFLib.PDFRef} field
 */
PDFLib.PDFAcroForm.prototype.addField = function(field){};
/** @type {PDFLib.PDFDict} */
PDFLib.PDFAcroForm.prototype.dict;

/**
 * @constructor
 * @extends {PDFLib.PDFDict}
 */
PDFLib.PDFCatalog = function(){};
/**
 * @param {PDFLib.PDFName} name
 * @param {PDFLib.PDFObject} object
 */
PDFLib.PDFCatalog.prototype.set = function(name, object){};
/**
 * @return {PDFLib.PDFDict}
 */
PDFLib.PDFCatalog.prototype.AcroForm = function(){};
/**
 * @return {PDFLib.PDFAcroForm}
 */
PDFLib.PDFCatalog.prototype.getOrCreateAcroForm = function(){};

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

/**
 * @constructor
 * @extends {PDFLib.PDFDict}
 */
PDFLib.PDFPageLeaf = function(){};
/**
 * @param {PDFLib.PDFName} name
 * @param {PDFLib.PDFObject} object
 */
PDFLib.PDFPageLeaf.prototype.set = function(name, object){};
/**
 * @return {PDFLib.PDFArray}
 */
PDFLib.PDFPageLeaf.prototype.Annots = function(){};

/**
 * @constructor
 * @extends {PDFLib.PDFObject}
 */
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

/**
 * @constructor
 */
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
 *    Info: PDFLib.PDFRef,
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
 * @param {string|Uint8Array} contents
 * @param {PDFLib.PDFDict=} dict
 * @return {PDFLib.PDFRawStream}
 */
PDFLib.PDFContext.prototype.flateStream = function(contents, dict){};
/**
 * @param {PDFLib.PDFRef} ref
 * @return {PDFLib.PDFObject}
 */
PDFLib.PDFContext.prototype.lookup = function(ref){};
/**
 * @param {PDFLib.PDFRef} ref
 * @param {*} typ
 * @return {PDFLib.PDFObject}
 */
PDFLib.PDFContext.prototype.lookupMaybe = function(ref, typ){};

/** @constructor */
PDFLib.PDFObject = function(){};
/** @type {Map<PDFLib.PDFRef, PDFLib.PDFObject>} */
PDFLib.PDFObject.prototype.dict;
/** @type {Array<PDFLib.PDFName>} */
PDFLib.PDFObject.prototype.array;
/**
 * @param {Array<number>} _buffer
 * @param {number} _offset
 * @return {number}
 */
PDFLib.PDFObject.prototype.copyBytesInto = function(_buffer, _offset){};

/**
 * @constructor
 * @extends {PDFLib.PDFObject}
 */
PDFLib.PDFName = function(){};
/** @type {PDFLib.PDFName} */
PDFLib.PDFName.Annots;
/**
 * @param {string} value
 * @return {PDFLib.PDFName}
 */
PDFLib.PDFName.of = function(value){};
/** @type {string} */
PDFLib.PDFName.prototype.encodedName;
/** @type {number} */
PDFLib.PDFName.prototype.numberValue;
/** @return {string} */
PDFLib.PDFName.prototype.value = function(){};

/**
 * @constructor
 * @extends {PDFLib.PDFObject}
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
 * @return {Array<PDFLib.PDFObject>}
 */
PDFLib.PDFArray.prototype.asArray = function(){};

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
 * @return {string}
 */
PDFLib.PDFString.prototype.asString = function(){};

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
 * @return {string}
 */
PDFLib.PDFHexString.prototype.decodeText = function(){};

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
 * @param {PDFLib.PDFDict} dict
 * @param {Array<PDFLib.PDFOperator>} operators
 * @param {boolean=} encode
 * @return {PDFLib.PDFContentStream}
 */
PDFLib.PDFContentStream.of = function(dict, operators, encode){};
/**
 * @constructor
 * @extends {PDFLib.PDFStream}
 */
PDFLib.PDFRawStream = function(){};

/**
 * @constructor
 * @extends {PDFLib.PDFObject}
 */
PDFLib.PDFCrossRefSection = function(){};
/**
 * @return {PDFLib.PDFCrossRefSection}
 */
PDFLib.PDFCrossRefSection.create = function(){};
/**
 * @param {PDFLib.PDFRef} ref
 * @param {number} offset
 */
PDFLib.PDFCrossRefSection.prototype.addEntry = function (ref, offset){};
/**
 * @constructor
 * @extends {PDFLib.PDFObject}
 */
PDFLib.PDFDict = function(){};
/**
 * @param {PDFLib.PDFName} key
 * @param {PDFLib.PDFObject} value
 */
PDFLib.PDFDict.prototype.set = function(key, value){};
/**
 * @param {PDFLib.PDFName} key
 * @param {*} typ
 * @return {PDFLib.PDFObject}
 */
PDFLib.PDFDict.prototype.lookupMaybe = function(key, typ){};
/**
 * @param {PDFLib.PDFName} key
 * @return {PDFLib.PDFObject}
 */
PDFLib.PDFDict.prototype.lookup = function(key){};

/**
 * @constructor
 * @extends {PDFLib.PDFObject}
 */
PDFLib.PDFWriter = function(){};
/**
 * @param {PDFLib.PDFContext} context
 * @param {number} objectsPerTick
 * @return {PDFLib.PDFWriter}
 */
PDFLib.PDFWriter.forContext = function(context, objectsPerTick){};
/**
 * @return {PDFLib.PDFDict}
 */
PDFLib.PDFWriter.prototype.createTrailerDict = function(){};
/**
 * @constructor
 * @extends {PDFLib.PDFObject}
 */
PDFLib.PDFTrailerDict = function(){};
/**
 * @param {PDFLib.PDFDict} dict
 * @return {PDFLib.PDFTrailerDict}
 */
PDFLib.PDFTrailerDict.of = function(dict){};
/**
 * @constructor
 * @extends {PDFLib.PDFObject}
 */
PDFLib.PDFTrailer = function(){};
/**
 * @param {number} offset
 * @return {PDFLib.PDFTrailer}
 */
PDFLib.PDFTrailer.forLastCrossRefSectionOffset = function(offset){};
