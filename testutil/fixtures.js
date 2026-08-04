"use strict";

const Zga = require("../lib/zganode.js");
const forge = Zga.forge;

/** @type {Map<string, string>} in-process cache to avoid regenerating keys */
const cache = new Map();

/**
 * Build a self-signed PKCS#12 (returned as a DER binary string) carrying an
 * RSA key of the given modulus length. Used to exercise the CCN-STIC-221
 * key-length guard in loadP12cert without shipping binary fixtures.
 *
 * @param {number} bits RSA modulus length in bits.
 * @param {string} pwd PKCS#12 password.
 * @return {string} DER-encoded PKCS#12 as a binary string.
 */
function makeP12(bits, pwd){
	const cacheKey = bits + ":" + pwd;
	if(cache.has(cacheKey)){
		return cache.get(cacheKey);
	}
	const keys = forge.pki.rsa.generateKeyPair({bits: bits, e: 0x10001});
	const cert = forge.pki.createCertificate();
	cert.publicKey = keys.publicKey;
	cert.serialNumber = "01";
	cert.validity.notBefore = new Date(2020, 0, 1);
	cert.validity.notAfter = new Date(2030, 0, 1);
	const attrs = [{name: "commonName", value: "zgapdfsigner-test"}];
	cert.setSubject(attrs);
	cert.setIssuer(attrs);
	cert.sign(keys.privateKey, forge.md.sha256.create());
	const asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], pwd, {algorithm: "3des"});
	const der = forge.asn1.toDer(asn1).getBytes();
	cache.set(cacheKey, der);
	return der;
}

module.exports = {makeP12: makeP12};
