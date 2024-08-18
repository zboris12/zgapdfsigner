import * as forge from "node-forge";
import * as PDFLib from "pdf-lib";
export * as forge from "node-forge";
export * as PDFLib from "pdf-lib";

export declare function u8arrToRaw(uarr: Uint8Array): string;
export declare function rawToU8arr(raw: string): Uint8Array;
export declare namespace Crypto {
  enum Mode {
    RC4_40,
    RC4_128,
    AES_128,
    AES_256,
  }
}
export type DSSInfo = {
  certs?: Array<forge.pki.Certificate>;
  ocsps?: Array<Uint8Array>;
  crls?: Array<Uint8Array>;
};
export type EncryptOption = {
  mode: Crypto.Mode;
  permissions?: Array<string>;
  userpwd?: string;
  ownerpwd?: string;
  pubkeys?: Array<PubKeyInfo>;
};
export type PubKeyInfo = {
  c?: Array<number> | Uint8Array | ArrayBuffer | string | forge.pki.Certificate;
  p?: Array<string>;
};
export type SignAreaInfo = {
  x: number;
  y: number;
  w?: number;
  h?: number;
};
export type SignTextInfo = {
  text: string,
  fontData?: Array<number> | Uint8Array | ArrayBuffer | PDFLib.StandardFonts;
  color?: string;
  opacity?: number;
  blendMode?: string;
  lineHeight?: number;
  size: number,
  xOffset?: number;
  yOffset?: number;
  wMax?: number;
  align?: number;
  noBreaks?: string;
};
export type SignImageInfo = {
  imgData: Array<number> | Uint8Array | ArrayBuffer | string;
  imgType: string;
  opacity?: number;
  blendMode?: string;
};
export type SignDrawInfo = {
  area: SignAreaInfo;
  pageidx?: number | string;
  /** @deprecated use imgInfo instead */
  imgData?: Array<number> | Uint8Array | ArrayBuffer | string;
  /** @deprecated use imgInfo instead */
  imgType?: string;
  imgInfo?: SignImageInfo;
  textInfo?: SignTextInfo;
};
export type SignOption = {
  p12cert?: Array<number> | Uint8Array | ArrayBuffer | string;
  pwd?: string;
  permission?: number;
  reason?: string;
  location?: string;
  contact?: string;
  signdate?: Date | TsaServiceInfo | string;
  signame?: string;
  drawinf?: SignDrawInfo;
  ltv?: number;
  debug?: boolean;
};
export type TsaServiceInfo = {
  url: string;
  len?: number;
  headers?: Record<string, any>;
};

export declare class CertsChain {
  constructor(certs?: Array<forge.pki.Certificate | forge.asn1.Asn1 | string>);
  buildChain(cert: forge.pki.Certificate): Promise<boolean>;
  getAllCerts(): Array<forge.pki.Certificate>;
  getSignCert(): forge.pki.Certificate;
  isSelfSignedCert(): boolean;
  prepareDSSInf(crlOnly?: boolean): Promise<DSSInfo>;
}
export declare class PdfCryptor {
  constructor(encopt: EncryptOption);
  encryptPdf(pdf: PDFLib.PDFDocument | Array<number> | Uint8Array | ArrayBuffer | string, ref?: PDFLib.PDFRef): Promise<PDFLib.PDFDocument>;
  encryptObject(num: number, val: PDFLib.PDFObject): void;
}
export declare class PdfSigner {
  constructor(signopt: SignOption);
  sign(pdf: PDFLib.PDFDocument | Array<number> | Uint8Array | ArrayBuffer | string, cypopt?: EncryptOption): Promise<Uint8Array>;
}
export declare class TsaFetcher {
  constructor(inf: TsaServiceInfo);
  url: string;
  len: number;
  getCertsChain(): CertsChain;
  getToken(forP7?: boolean): forge.asn1.Asn1;
  queryTsa(data?: string): Promise<string>;
}
export declare class PdfFonts {
  private constructor();
  static from(pdfdoc: PDFLib.PDFDocument): Promise<PdfFonts>;
  getEmbeddedFont(fontData?: Array<number> | Uint8Array | ArrayBuffer | PDFLib.StandardFonts): Promise<PDFLib.PDFFont>;
}
