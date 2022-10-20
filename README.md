# ZgaPdfSigner
A javascript tool to sign a pdf or set protection of a pdf in web browser.  
And it also can be used in Google Apps Script.  

PS: __ZGA__ is the abbreviation of my father's name.  
And I use this name to hope the merits from this application will be dedicated to my parents.

## Main features

* Sign a pdf with an invisible pkcs#7 signature.
* Sign a pdf with a visible pkcs#7 signature by drawing an image.
* Sign a pdf and set DocMDP(document modification detection and prevention).
* Add a new signature to a pdf if it has been signed already. (An incremental update)
* Sign a pdf with a timestamp from TSA(Time Stamp Authority). (Only in Google Apps Script)
* Set password protection to a pdf. Supported algorithms:
  * 40bit RC4 Encryption
  * 128bit RC4 Encryption
  * 128bit AES Encryption
  * 256bit AES Encryption
* Set public-key certificate protection to a pdf.
  Supported algorithms are as same as the password protection.

## About signing with TSA

Because of the CORS security restrictions in web browser,
signing with a timestamp from TSA can only be used in Google Apps Script.

## The Dependencies

* [pdf-lib](https://pdf-lib.js.org/)
* [node-forge](https://github.com/digitalbazaar/forge)

## How to use this tool

Just import the dependencies and this tool.
```html
<script src="https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js" type="text/javascript"></script>
<script src="https://unpkg.com/node-forge@1.3.1/dist/forge.min.js" type="text/javascript"></script>
<script src="https://github.com/zboris12/zgapdfsigner/releases/download/2.2.0/zgapdfsigner.min.js" type="text/javascript"></script>
```

## Let's sign

Sign with an invisible signature.

```js
/**
 * @param {ArrayBuffer} pdf
 * @param {ArrayBuffer} cert
 * @param {string} pwd
 * @return {Promise<Blob>}
 */
async function sign1(pdf, cert, pwd){
  /** @type {SignOption} */
  var sopt = {
    p12cert: cert,
    pwd: pwd,
    permission: 1,
  };
  var signer = new Zga.PdfSigner(sopt);
  var u8arr = await signer.sign(pdf);
  return new Blob([u8arr], {"type" : "application/pdf"});
}
```

Sign with a visible signature of an image.

```js
/**
 * @param {ArrayBuffer} pdf
 * @param {ArrayBuffer} cert
 * @param {string} pwd
 * @param {ArrayBuffer} imgdat
 * @param {string} imgtyp
 * @return {Promise<Blob>}
 */
async function sign2(pdf, cert, pwd, imgdat, imgtyp){
  /** @type {SignOption} */
  var sopt = {
    p12cert: cert,
    pwd: pwd,
    drawinf: {
      area: {
        x: 25,  // left
        y: 150, // top
        w: 60,  // width
        h: 60,  // height
      },
      imgData: imgdat,
      imgType: imgtyp,
    },
  };
  var signer = new Zga.PdfSigner(sopt);
  var u8arr = await signer.sign(pdf);
  return new Blob([u8arr], {"type" : "application/pdf"});
}
```

Sign with a visible signature of drawing a text.

```js
//TODO
```

Use it in Google Apps Script

```js
// Simulate setTimeout function for pdf-lib
function setTimeout(func, sleep){
  Utilities.sleep(sleep);
  func();
}
// Simulate window for node-forge
var window = globalThis;
// Load pdf-lib
eval(UrlFetchApp.fetch("https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js").getContentText());
// Load node-forge
eval(UrlFetchApp.fetch("https://unpkg.com/node-forge@1.3.1/dist/forge.min.js").getContentText());
// Load ZgaPdfSigner
eval(UrlFetchApp.fetch("https://github.com/zboris12/zgapdfsigner/releases/download/2.2.0/zgapdfsigner.min.js").getContentText());

// Load pdf, certificate
var pdfBlob = DriveApp.getFilesByName("_test.pdf").next().getBlob();
var certBlob = DriveApp.getFilesByName("_test.pfx").next().getBlob();
// Sign the pdf
/** @type {SignOption} */
var sopt = {
  p12cert: certBlob.getBytes(),
  pwd: "some passphrase",
  signdate: "1",
};
var signer = new Zga.PdfSigner(sopt);
var u8arr = await signer.sign(pdfBlob.getBytes());
// Save the result pdf to some folder
var fld = DriveApp.getFolderById("a folder's id");
fld.createFile(Utilities.newBlob(u8arr, "application/pdf").setName("signed_test.pdf"));
```

## Detail of SignOption

* __p12cert__: Array<number>|Uint8Array|ArrayBuffer|string :point_right: Certificate's data
* __pwd__: string :point_right: The passphrase of the certificate
* __permission__: number :point_right: (Optional) The modification permissions granted for this document.
  This is a setting of DocMDP(document modification detection and prevention). Valid values are:
  * 1: No changes to the document are permitted; any change to the document invalidates the signature.
  * 2: Permitted changes are filling in forms, instantiating page templates, and signing; other changes invalidate the signature.
  * 3: Permitted changes are the same as for 2, as well as annotation creation, deletion, and modification; other changes invalidate the signature.
* __reason__: string :point_right: (Optional) The reason for signing
* __location__: string :point_right: (Optional) Your location
* __contact__: string :point_right: (Optional) Your contact information
* __signdate__: Date|string|_TsaServiceInfo_ :point_right: (Optional)
  * When it is a Date, it means the date and time of signing.
  * When it is a string, it can be an url of TSA or an index of the preset TSAs as below:
    * "1": http://ts.ssl.com
    * "2": http://timestamp.digicert.com
    * "3": http://timestamp.sectigo.com
    * "4": http://timestamp.entrust.net/TSS/RFC3161sha2TS
    * "5": http://timestamp.apple.com/ts01
    * "6": http://www.langedge.jp/tsa
    * "7": https://freetsa.org/tsr
  * When it is a _TsaServiceInfo_, it means a full customized information of a TSA.
    * __url__: string :point_right: The url of TSA
    * __len__: number :point_right: (Optional) The length of signature's placeholder
  * When it is omitted, the system timestamp will be used.
* __signame__: string :point_right: (Optional) The name of the signature
* __drawinf__: _SignDrawInfo_ :point_right: (Optional) Visible signature's information
  * __area__: _SignAreaInfo_ :point_right: The signature's drawing area, these numbers are dots on 72dpi.
    * __x__: number :point_right: Distance from left
    * __y__: number :point_right: Distance from top
    * __w__: number :point_right: Width
    * __h__: number :point_right: Height
  * __pageidx__: number :point_right: (Optional) The index of a page where the signature will be drawn.
  * __imgData__: Array<number>|Uint8Array|ArrayBuffer|string :point_right: (Optional) The image's data
  * __imgType__: string :point_right: (Optional) The image's type, <ins>only support jpg and png</ins>
  * __text__: string :point_right: (Optional) A text drawing for the signature, <ins>not implemented yet</ins>
  * __fontData__: PDFLib.StandardFonts|Array<number>|Uint8Array|ArrayBuffer|string :point_right: (Optional) The font's data for drawing text, <ins>not implemented yet</ins>

## Let's protect the pdf

Set password protection to the pdf.

```js
/**
 * @param {ArrayBuffer} pdf
 * @param {string} upwd
 * @param {string} opwd
 * @return {Promise<Blob>}
 */
async function protect1(pdf, upwd, opwd){
  /** @type {EncryptOption} */
  var eopt = {
    mode: Zga.Crypto.Mode.RC4_40,
    permissions: ["modify", "annot-forms", "fill-forms", "extract", "assemble"],
    userpwd: upwd,
    ownerpwd: opwd,
  };
  var cyptor = new Zga.PdfCryptor(eopt);
  var pdfdoc = await cyptor.encryptPdf(pdf);
  u8arr = await pdfdoc.save({"useObjectStreams": false});
  return new Blob([u8arr], {"type" : "application/pdf"});
}
```

Set public-key certificate protection to the pdf.

```js
/**
 * @param {ArrayBuffer} pdf
 * @param {ArrayBuffer} cert
 * @return {Promise<Blob>}
 */
async function protect2(pdf, cert){
  /** @type {EncryptOption} */
  var eopt = {
    mode: Zga.Crypto.Mode.AES_128,
    pubkeys: [{
      c: cert,
      p: ["copy", "modify", "copy-extract", "annot-forms", "fill-forms", "extract", "assemble"],
    }],
  };
  var cyptor = new Zga.PdfCryptor(eopt);
  var pdfdoc = await cyptor.encryptPdf(pdf);
  u8arr = await pdfdoc.save({"useObjectStreams": false});
  return new Blob([u8arr], {"type" : "application/pdf"});
}
```

Sign and set protection.

```js
/**
 * @param {ArrayBuffer} pdf
 * @param {ArrayBuffer} cert
 * @param {string} pwd
 * @param {string} opwd
 * @return {Promise<Blob>}
 */
async function signAndProtect1(pdf, cert, pwd, opwd){
  /** @type {SignOption} */
  var sopt = {
    p12cert: cert,
    pwd: pwd,
  };
  /** @type {EncryptOption} */
  var eopt = {
    mode: Zga.Crypto.Mode.RC4_128,
    permissions: ["modify", "annot-forms", "fill-forms", "extract", "assemble"],
    ownerpwd: opwd,
  };
  var signer = new Zga.PdfSigner(sopt);
  var u8arr = await signer.sign(pdf, eopt);
  return new Blob([u8arr], {"type" : "application/pdf"});
}
```

Sign and set protection by the same certificate.

```js
/**
 * @param {ArrayBuffer} pdf
 * @param {ArrayBuffer} cert
 * @param {string} pwd
 * @return {Promise<Blob>}
 */
async function signAndProtect2(pdf, cert, pwd){
  /** @type {SignOption} */
  var sopt = {
    p12cert: cert,
    pwd: pwd,
  };
  /** @type {EncryptOption} */
  var eopt = {
    mode: Zga.Crypto.Mode.AES_256,
    permissions: ["modify", "annot-forms", "fill-forms", "extract", "assemble"],
    pubkeys: [],
  };
  var signer = new Zga.PdfSigner(sopt);
  var u8arr = await signer.sign(pdf, eopt);
  return new Blob([u8arr], {"type" : "application/pdf"});
}
```

## Detail of EncryptOption

* __mode__: Zga.Crypto.Mode :point_right: The values of Zga.Crypto.Mode
  * RC4_40: 40bit RC4 Encryption
  * RC4_128: 128bit RC4 Encryption
  * AES_128: 128bit AES Encryption
  * AES_256: 256bit AES Encryption
* __permissions__: Array<string> :point_right: (Optional) The set of permissions to be blocked
  * "copy": (Only valid on public-key mode) Copy text and graphics from the document;
  * "print": Print the document;
  * "modify": Modify the contents of the document by operations other than those controlled by 'fill-forms', 'extract' and 'assemble';
  * "copy-extract": Copy or otherwise extract text and graphics from the document;
  * "annot-forms": Add or modify text annotations, fill in interactive form fields, and, if 'modify' is also set, create or modify interactive form fields (including signature fields);
  * "fill-forms": Fill in existing interactive form fields (including signature fields), even if 'annot-forms' is not specified;
  * "extract": Extract text and graphics (in support of accessibility to users with disabilities or for other purposes);
  * "assemble": Assemble the document (insert, rotate, or delete pages and create bookmarks or thumbnail images), even if 'modify' is not set;
  * "print-high": Print the document to a representation from which a faithful digital copy of the PDF content could be generated. When this is not set, printing is limited to a low-level representation of the appearance, possibly of degraded quality.
* __userpwd__: string :point_right: (Optional) User password. Used when opening the pdf.
* __ownerpwd__: string :point_right: (Optional) Owner password. If not specified, a random value is used.
* __pubkeys__: Array<_PubKeyInfo_> :point_right: (Optional) Array of recipients containing public-key certificates ('c') and permissions ('p').
  * __c__: Array<number>|Uint8Array|ArrayBuffer|string|forge_cert :point_right: (Optional) A public-key certificate.
           Only when you want to encrypt the pdf by the certificate used in signing, the c can be omitted.
  * __p__: Array<string> :point_right: (Optional) Permissions

## Thanks
* The module of setting protection was almost migrated from [TCPDF](http://www.tcpdf.org).

## License

This tool is available under the
[MIT license](https://opensource.org/licenses/MIT).
