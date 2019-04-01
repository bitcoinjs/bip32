"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createHash = require('create-hash');
const createHmac = require('create-hmac');
let ripemd160;
try {
    ripemd160 = require('crypto')
        .getHashes()
        .includes('rmd160')
        ? 'rmd160'
        : 'ripemd160';
}
catch (err) {
    ripemd160 = 'rmd160';
}
function hash160(buffer) {
    return createHash(ripemd160)
        .update(createHash('sha256')
        .update(buffer)
        .digest())
        .digest();
}
exports.hash160 = hash160;
function hmacSHA512(key, data) {
    return createHmac('sha512', key)
        .update(data)
        .digest();
}
exports.hmacSHA512 = hmacSHA512;
