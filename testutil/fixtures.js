"use strict";

const Zga = require("../lib/zganode.js");
const forge = Zga.forge;

/** @type {Map<number, {privateKey: *, publicKey: *, certificate: *}>} key cache */
const keyCache = new Map();

/**
 * Generate (and cache) a self-signed RSA key pair + certificate of the given
 * modulus length, as raw node-forge objects.
 *
 * @param {number} bits RSA modulus length in bits.
 * @return {{privateKey: *, publicKey: *, certificate: *}}
 */
function makeKeyCert(bits){
	if(keyCache.has(bits)){
		return keyCache.get(bits);
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
	const entry = {privateKey: keys.privateKey, publicKey: keys.publicKey, certificate: cert};
	keyCache.set(bits, entry);
	return entry;
}

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
	const kc = makeKeyCert(bits);
	const asn1 = forge.pkcs12.toPkcs12Asn1(kc.privateKey, [kc.certificate], pwd, {algorithm: "3des"});
	return forge.asn1.toDer(asn1).getBytes();
}

module.exports = {makeKeyCert: makeKeyCert, makeP12: makeP12};
