const createHash = require('create-hash');
const createHmac = require('create-hmac');

let ripemd160: string;
try {
  ripemd160 = require('crypto')
    .getHashes()
    .includes('rmd160')
    ? 'rmd160'
    : 'ripemd160';
} catch (err) {
  ripemd160 = 'rmd160';
}

export function hash160(buffer: Buffer): Buffer {
  return createHash(ripemd160)
    .update(
      createHash('sha256')
        .update(buffer)
        .digest(),
    )
    .digest();
}

export function hmacSHA512(key: Buffer, data: Buffer): Buffer {
  return createHmac('sha512', key)
    .update(data)
    .digest();
}
