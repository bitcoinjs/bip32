"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hash160 = hash160;
exports.hmacSHA512 = hmacSHA512;
const hmac_1 = require("@noble/hashes/hmac");
const ripemd160_1 = require("@noble/hashes/ripemd160");
const sha256_1 = require("@noble/hashes/sha256");
const sha512_1 = require("@noble/hashes/sha512");
function hash160(buffer) {
    return (0, ripemd160_1.ripemd160)((0, sha256_1.sha256)(buffer));
}
function hmacSHA512(key, data) {
    return (0, hmac_1.hmac)(sha512_1.sha512, key, data);
}
