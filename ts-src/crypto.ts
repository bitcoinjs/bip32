const createHash = require('create-hash');
const createHmac = require('create-hmac');

export function hash160(buffer: Buffer): Buffer {
  return createHash('rmd160')
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
