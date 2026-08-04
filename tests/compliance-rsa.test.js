"use strict";

const {test} = require("node:test");
const assert = require("node:assert");
const Zga = require("../lib/zganode.js");
const {makeP12} = require("../testutil/fixtures.js");

const PWD = "test-pw";

// CCN-STIC-221: RSA modulus must be >= 3000 bits and the public exponent must
// satisfy log2(e) > 16. The production change that makes these fail is removing
// the corresponding guard added in PdfSigner.loadP12cert.

test("rejects an RSA key shorter than 3000 bits", () => {
	const p12 = makeP12(2048, PWD);
	const signer = new Zga.PdfSigner({});
	assert.throws(
		() => signer.loadP12cert(p12, PWD),
		/below the 3000-bit minimum/,
	);
});

test("accepts an RSA key of 3072 bits", () => {
	const p12 = makeP12(3072, PWD);
	const signer = new Zga.PdfSigner({});
	assert.doesNotThrow(() => signer.loadP12cert(p12, PWD));
});

test("honors a custom minRsaKeyBits threshold below the default", () => {
	const p12 = makeP12(2048, PWD);
	const signer = new Zga.PdfSigner({minRsaKeyBits: 2048});
	assert.doesNotThrow(() => signer.loadP12cert(p12, PWD));
});

// The modulus check runs first, so minRsaKeyBits is lowered here purely to let
// a cheap-to-generate key reach the exponent check.
test("rejects an RSA public exponent with log2(e) <= 16", () => {
	const p12 = makeP12(1024, PWD, 3);
	const signer = new Zga.PdfSigner({minRsaKeyBits: 1024});
	assert.throws(
		() => signer.loadP12cert(p12, PWD),
		/public exponent is too small/,
	);
});

test("accepts the standard 65537 public exponent", () => {
	const p12 = makeP12(1024, PWD, 65537);
	const signer = new Zga.PdfSigner({minRsaKeyBits: 1024});
	assert.doesNotThrow(() => signer.loadP12cert(p12, PWD));
});
