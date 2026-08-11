"use strict";

const {test} = require("node:test");
const assert = require("node:assert");
const Zga = require("../lib/zganode.js");

const Mode = Zga.Crypto.Mode;

// CCN-STIC-221: RC4 (any stream cipher) and MD5-based key derivation are not
// authorized. Only the AES-256 handler avoids both. Enforcement is opt-in via
// strictCrypto, so the default stays backward compatible. The production change
// that makes these fail is removing the mode guard in the PdfCryptor constructor.

test("allows every legacy mode by default", () => {
	assert.doesNotThrow(() => new Zga.PdfCryptor({mode: Mode.RC4_40, userpwd: "x"}));
	assert.doesNotThrow(() => new Zga.PdfCryptor({mode: Mode.RC4_128, userpwd: "x"}));
	assert.doesNotThrow(() => new Zga.PdfCryptor({mode: Mode.AES_128, userpwd: "x"}));
});

test("rejects RC4-40 encryption under strictCrypto", () => {
	assert.throws(
		() => new Zga.PdfCryptor({mode: Mode.RC4_40, userpwd: "x", strictCrypto: true}),
		/not authorized by CCN-STIC-221/,
	);
});

test("rejects RC4-128 encryption under strictCrypto", () => {
	assert.throws(
		() => new Zga.PdfCryptor({mode: Mode.RC4_128, userpwd: "x", strictCrypto: true}),
		/not authorized by CCN-STIC-221/,
	);
});

test("rejects AES-128 encryption under strictCrypto", () => {
	assert.throws(
		() => new Zga.PdfCryptor({mode: Mode.AES_128, userpwd: "x", strictCrypto: true}),
		/not authorized by CCN-STIC-221/,
	);
});

test("accepts AES-256 encryption under strictCrypto", () => {
	assert.doesNotThrow(
		() => new Zga.PdfCryptor({mode: Mode.AES_256, userpwd: "x", strictCrypto: true}),
	);
});
