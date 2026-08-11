"use strict";

const {test} = require("node:test");
const assert = require("node:assert");
const Zga = require("../lib/zganode.js");
const {makeKeyCert} = require("../testutil/fixtures.js");
const forge = Zga.forge;

// Crypto-agility seam (Update 4): a Signer abstraction decouples the signature
// algorithm from the PDF/PKCS#7 assembly. RsaSigner captures the current
// RSA + SHA-256 behavior behind that interface.

test("RsaSigner.sign produces a SHA-256 RSA signature that verifies against the certificate public key", () => {
	const {privateKey, certificate} = makeKeyCert(3072);
	const signer = new Zga.RsaSigner(privateKey, certificate);
	const data = "hello zgapdfsigner";

	const signature = signer.sign(data);

	const md = forge.md.sha256.create();
	md.update(data);
	assert.strictEqual(certificate.publicKey.verify(md.digest().bytes(), signature), true);
});

test("RsaSigner reports SHA-256 as its digest algorithm OID", () => {
	const {privateKey, certificate} = makeKeyCert(3072);
	const signer = new Zga.RsaSigner(privateKey, certificate);

	assert.strictEqual(signer.getDigestAlgorithmOid(), forge.pki.oids.sha256);
});

test("RsaSigner reports sha256WithRSAEncryption as its signature algorithm OID", () => {
	const {privateKey, certificate} = makeKeyCert(3072);
	const signer = new Zga.RsaSigner(privateKey, certificate);

	assert.strictEqual(signer.getSignatureAlgorithmOid(), forge.pki.oids.sha256WithRSAEncryption);
});

test("createSigner returns an RsaSigner for an RSA key", () => {
	const {privateKey, certificate} = makeKeyCert(3072);

	const signer = Zga.createSigner(privateKey, certificate);

	assert.ok(signer instanceof Zga.RsaSigner);
});

test("createSigner rejects an unsupported (non-RSA) key type", () => {
	assert.throws(
		() => Zga.createSigner({}, null),
		/only RSA keys are supported/,
	);
});
