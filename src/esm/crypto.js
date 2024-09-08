import { hmac } from '@noble/hashes/hmac';
import { ripemd160 } from '@noble/hashes/ripemd160';
import { sha256 } from '@noble/hashes/sha256';
import { sha512 } from '@noble/hashes/sha512';
export function hash160(buffer) {
    return ripemd160(sha256(buffer));
}
export function hmacSHA512(key, data) {
    return hmac(sha512, key, data);
}
