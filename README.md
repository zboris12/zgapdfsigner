# ZgaPdfSigner
A javascript tool to sign a pdf in web browser.  

PS: __ZGA__ is the abbreviation of my father's name.  
And I use this name to hope the merits from this application will be dedicated to my parents.

## The Dependencies

* [pdf-lib](https://pdf-lib.js.org/)
* [node-forge](https://github.com/digitalbazaar/forge)

## How to use this tool

Just import the dependencies and this tool.
```html
<script src="https://unpkg.com/pdf-lib/dist/pdf-lib.min.js" type="text/javascript"></script>
<script src="https://unpkg.com/node-forge/dist/forge.min.js" type="text/javascript"></script>
<script src="https://github.com/zboris12/zgapdfsigner/releases/download/1.0.0/zgapdfsigner.js" type="text/javascript"></script>
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
  };
  var signer = new PdfSigner(sopt);
  return await signer.sign(pdf);
}
```

Sign with a visible signature of a picture.

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
  var signer = new PdfSigner(sopt);
  return await signer.sign(pdf);
}
```

Sign with a visible signature of drawing a text.

```js
//TODO
```

## Detail of SignOption

* __p12cert__:  string :point_right: A raw data of the certificate 
* __pwd__:      string :point_right: The passphrase of the certificate
* __reason__:   string :point_right: (Optional) The reason for signing
* __location__: string :point_right: (Optional) Your location
* __contact__:  string :point_right: (Optional) Your contact information
* __signdate__: Date   :point_right: (Optional) The date and time of signing
* __signame__:  string :point_right: (Optional) The name of the signature
* __drawinf__:  SignDrawInfo :point_right: (Optional) Visible signature's information
  * __area__: SignAreaInfo :point_right: The signature's drawing area
    * __x__: number :point_right: Distance from left
    * __y__: number :point_right: Distance from top
    * __w__: number :point_right: Width
    * __h__: number :point_right: Height
  * __pageidx__: number :point_right: (Optional) The page index for drawing the signature
  * __imgData__: Uint8Array|ArrayBuffer|string :point_right: (Optional) The image's data
  * __imgType__: string :point_right: (Optional) The image's type, __only support jpg and png__
  * __text__: string :point_right: (Optional) A text drawing on signature, __not implemented yet__
  * __fontData__: PDFLib.StandardFonts|Uint8Array|ArrayBuffer|string :point_right: (Optional) The font's data for drawing text, __not implemented yet__


## License

This tool is available under the
[MIT license](https://opensource.org/licenses/MIT).
