"use strict";

const {test} = require("node:test");
const assert = require("node:assert");
const Zga = require("../lib/zganode.js");

// Characterization tests: lock in existing behavior so future refactors
// (e.g. the crypto-agility work) cannot silently change it.

test("rawToU8arr and u8arrToRaw round-trip binary data", () => {
	const raw = "\x00\x01\x41\xff\x7e";
	const u8 = Zga.rawToU8arr(raw);
	assert.ok(u8 instanceof Uint8Array);
	assert.strictEqual(u8.length, raw.length);
	assert.strictEqual(Zga.u8arrToRaw(u8), raw);
});

test("Crypto.Mode enumerates the four PDF encryption handlers", () => {
	assert.deepStrictEqual(Zga.Crypto.Mode, {RC4_40: 0, RC4_128: 1, AES_128: 2, AES_256: 3});
});

test("getUserPermissionCode clears exactly the print bit when print is blocked", () => {
	const base = Zga.Crypto.getUserPermissionCode([], Zga.Crypto.Mode.AES_256);
	const noPrint = Zga.Crypto.getUserPermissionCode(["print"], Zga.Crypto.Mode.AES_256);
	assert.strictEqual(base - noPrint, Zga.Crypto.Permission["print"]);
});
