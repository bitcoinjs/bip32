"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hmac_1 = require("@noble/hashes/hmac");
const ripemd160_1 = require("@noble/hashes/ripemd160");
const sha256_1 = require("@noble/hashes/sha256");
const sha512_1 = require("@noble/hashes/sha512");
function hash160(buffer) {
    const sha256Hash = sha256_1.sha256(Uint8Array.from(buffer));
    return Buffer.from(ripemd160_1.ripemd160(sha256Hash));
}
exports.hash160 = hash160;
function hmacSHA512(key, data) {
    return Buffer.from(hmac_1.hmac(sha512_1.sha512, key, data));
}
exports.hmacSHA512 = hmacSHA512;
