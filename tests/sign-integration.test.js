"use strict";

const {test} = require("node:test");
const assert = require("node:assert");
const Zga = require("../lib/zganode.js");
const {makeP12} = require("../testutil/fixtures.js");

const PWD = "test-pw";

/**
 * Build a minimal one-page PDF with pdf-lib.
 * @return {Promise<Uint8Array>}
 */
async function minimalPdf(){
	const doc = await Zga.PDFLib.PDFDocument.create();
	doc.addPage([300, 300]);
	return doc.save();
}

// End-to-end safety net for the crypto-agility refactor: signing a real PDF
// must keep producing a valid detached PKCS#7 signature dictionary.
test("PdfSigner.sign produces a detached PKCS#7 signature over a real PDF", async () => {
	const pdfBytes = await minimalPdf();
	const signer = new Zga.PdfSigner({p12cert: makeP12(3072, PWD), pwd: PWD});

	const signed = await signer.sign(pdfBytes);
	const dump = Buffer.from(signed).toString("latin1");

	assert.ok(signed instanceof Uint8Array, "returns a Uint8Array");
	assert.ok(signed.length > pdfBytes.length, "signed output is larger than the input");
	assert.match(dump, /adbe\.pkcs7\.detached/, "uses the detached PKCS#7 SubFilter");
	assert.match(dump, /ByteRange/, "embeds a ByteRange");
	assert.match(dump, /\/Type\s*\/Sig/, "embeds a signature dictionary");
});

// The combined sign + encrypt path: PdfSigner.sign delegates to PdfCryptor, so
// the CCN-STIC-221 mode guard must hold here too, not only on direct use.
test("PdfSigner.sign encrypts the output when an AES-256 EncryptOption is given", async () => {
	const pdfBytes = await minimalPdf();
	const signer = new Zga.PdfSigner({p12cert: makeP12(3072, PWD), pwd: PWD});

	const signed = await signer.sign(pdfBytes, {
		mode: Zga.Crypto.Mode.AES_256,
		permissions: ["copy", "print-high"],
		userpwd: "user-pw",
	});
	const dump = Buffer.from(signed).toString("latin1");

	assert.match(dump, /\/Encrypt/, "installs an encryption dictionary");
	assert.match(dump, /adbe\.pkcs7\.detached/, "still carries the detached signature");
});

test("PdfSigner.sign accepts a legacy encryption mode by default", async () => {
	const pdfBytes = await minimalPdf();
	const signer = new Zga.PdfSigner({p12cert: makeP12(3072, PWD), pwd: PWD});

	const signed = await signer.sign(pdfBytes, {mode: Zga.Crypto.Mode.RC4_128, userpwd: "user-pw"});

	assert.match(Buffer.from(signed).toString("latin1"), /\/Encrypt/);
});

// strictCrypto on the SignOption has to reach the cryptor, otherwise a caller
// asking for compliance would silently get a non-compliant encryption handler.
test("PdfSigner.sign propagates strictCrypto to the encryption step", async () => {
	const pdfBytes = await minimalPdf();
	const signer = new Zga.PdfSigner({p12cert: makeP12(3072, PWD), pwd: PWD, strictCrypto: true});

	await assert.rejects(
		() => signer.sign(pdfBytes, {mode: Zga.Crypto.Mode.RC4_128, userpwd: "user-pw"}),
		/not authorized by CCN-STIC-221/,
	);
});

test("an explicit strictCrypto on the EncryptOption wins over the SignOption", async () => {
	const pdfBytes = await minimalPdf();
	const signer = new Zga.PdfSigner({p12cert: makeP12(3072, PWD), pwd: PWD, strictCrypto: true});

	const signed = await signer.sign(pdfBytes, {
		mode: Zga.Crypto.Mode.RC4_128,
		userpwd: "user-pw",
		strictCrypto: false,
	});

	assert.match(Buffer.from(signed).toString("latin1"), /\/Encrypt/);
});
