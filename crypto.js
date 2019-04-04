let createHash = require('create-hash')
let createHmac = require('create-hmac')

let ripemd160
try {
  ripemd160 = require('crypto')
    .getHashes()
    .includes('rmd160')
    ? 'rmd160'
    : 'ripemd160'
} catch (err) {
  ripemd160 = 'rmd160'
}

function hash160 (buffer) {
  return createHash(ripemd160).update(
    createHash('sha256').update(buffer).digest()
  ).digest()
}

function hmacSHA512 (key, data) {
  return createHmac('sha512', key).update(data).digest()
}

module.exports = { hash160, hmacSHA512 }
