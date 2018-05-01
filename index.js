let Buffer = require('safe-buffer').Buffer
let bs58check = require('bs58check')
let crypto = require('./crypto')
let ecc = require('tiny-secp256k1')
let typeforce = require('typeforce')
let wif = require('wif')

let NETWORK_TYPE = typeforce.compile({
  wif: typeforce.UInt8,
  bip32: {
    public: typeforce.UInt32,
    private: typeforce.UInt32
  }
})

let BITCOIN = {
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  wif: 0x80
}

function BIP32 (d, Q, chainCode, network) {
  this.d = d || null
  this.Q = Q || ecc.pointFromScalar(d, true)
  if (this.Q === null) throw new TypeError('Bad public key')

  this.chainCode = chainCode
  this.depth = 0
  this.index = 0
  this.network = network
  this.parentFingerprint = 0x00000000
}

function fromSeed (seed, network) {
  typeforce(typeforce.Buffer, seed)
  if (seed.length < 16) throw new TypeError('Seed should be at least 128 bits')
  if (seed.length > 64) throw new TypeError('Seed should be at most 512 bits')
  if (network) typeforce(NETWORK_TYPE, network)
  network = network || BITCOIN

  let I = crypto.hmacSHA512('Bitcoin seed', seed)
  let IL = I.slice(0, 32)
  let IR = I.slice(32)

  // if IL is 0 or >= n, the master key is invalid
  if (!ecc.isPrivate(IL)) throw new TypeError('Private key not in range [1, n)')

  return new BIP32(IL, null, IR, network)
}

function fromBase58 (string, network) {
  let buffer = bs58check.decode(string)
  if (buffer.length !== 78) throw new TypeError('Invalid buffer length')
  if (network) typeforce(NETWORK_TYPE, network)
  network = network || BITCOIN

  // 4 bytes: version bytes
  let version = buffer.readUInt32BE(0)
  if (version !== network.bip32.private &&
    version !== network.bip32.public) throw new TypeError('Invalid network version')

  // 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 descendants, ...
  let depth = buffer[4]

  // 4 bytes: the fingerprint of the parent's key (0x00000000 if master key)
  let parentFingerprint = buffer.readUInt32BE(5)
  if (depth === 0) {
    if (parentFingerprint !== 0x00000000) throw new TypeError('Invalid parent fingerprint')
  }

  // 4 bytes: child number. This is the number i in xi = xpar/i, with xi the key being serialized.
  // This is encoded in MSB order. (0x00000000 if master key)
  let index = buffer.readUInt32BE(9)
  if (depth === 0 && index !== 0) throw new TypeError('Invalid index')

  // 32 bytes: the chain code
  let chainCode = buffer.slice(13, 45)
  let hd

  // 33 bytes: private key data (0x00 + k)
  if (version === network.bip32.private) {
    if (buffer.readUInt8(45) !== 0x00) throw new TypeError('Invalid private key')
    let k = buffer.slice(46, 78)

    // if IL is 0 or >= n, the master key is invalid
    if (!ecc.isPrivate(k)) throw new TypeError('Private key not in range [1, n)')
    hd = new BIP32(k, null, chainCode, network)

  // 33 bytes: public key data (0x02 + X or 0x03 + X)
  } else {
    let X = buffer.slice(45, 78)

    // verify the X coordinate is a point on the curve
    if (!ecc.isPoint(X)) throw new TypeError('Point is not on the curve')
    hd = new BIP32(null, X, chainCode, network)
  }

  hd.depth = depth
  hd.index = index
  hd.parentFingerprint = parentFingerprint
  return hd
}

BIP32.prototype.getIdentifier = function () {
  return crypto.hash160(this.Q)
}

BIP32.prototype.getFingerprint = function () {
  return this.getIdentifier().slice(0, 4)
}

BIP32.prototype.getNetwork = function () {
  return this.network
}

BIP32.prototype.getPrivateKey = function () {
  return this.d
}

BIP32.prototype.getPublicKey = function () {
  return this.Q
}

BIP32.prototype.neutered = function () {
  let neutered = new BIP32(null, this.Q, this.chainCode, this.network)
  neutered.depth = this.depth
  neutered.index = this.index
  neutered.parentFingerprint = this.parentFingerprint
  return neutered
}

BIP32.prototype.toBase58 = function () {
  let network = this.network
  let version = (!this.isNeutered()) ? network.bip32.private : network.bip32.public
  let buffer = Buffer.allocUnsafe(78)

  // 4 bytes: version bytes
  buffer.writeUInt32BE(version, 0)

  // 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 descendants, ....
  buffer.writeUInt8(this.depth, 4)

  // 4 bytes: the fingerprint of the parent's key (0x00000000 if master key)
  buffer.writeUInt32BE(this.parentFingerprint, 5)

  // 4 bytes: child number. This is the number i in xi = xpar/i, with xi the key being serialized.
  // This is encoded in big endian. (0x00000000 if master key)
  buffer.writeUInt32BE(this.index, 9)

  // 32 bytes: the chain code
  this.chainCode.copy(buffer, 13)

  // 33 bytes: the public key or private key data
  if (!this.isNeutered()) {
    // 0x00 + k for private keys
    buffer.writeUInt8(0, 45)
    this.d.copy(buffer, 46)

  // 33 bytes: the public key
  } else {
    // X9.62 encoding for public keys
    this.Q.copy(buffer, 45)
  }

  return bs58check.encode(buffer)
}

BIP32.prototype.toWIF = function () {
  if (!this.d) throw new TypeError('Missing private key')
  return wif.encode(this.network.wif, this.d, true)
}

let HIGHEST_BIT = 0x80000000

// https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#child-key-derivation-ckd-functions
BIP32.prototype.derive = function (index) {
  typeforce(typeforce.UInt32, index)

  let isHardened = index >= HIGHEST_BIT
  let data = Buffer.allocUnsafe(37)

  // Hardened child
  if (isHardened) {
    if (this.isNeutered()) throw new TypeError('Missing private key for hardened child key')

    // data = 0x00 || ser256(kpar) || ser32(index)
    data[0] = 0x00
    this.d.copy(data, 1)
    data.writeUInt32BE(index, 33)

  // Normal child
  } else {
    // data = serP(point(kpar)) || ser32(index)
    //      = serP(Kpar) || ser32(index)
    this.Q.copy(data, 0)
    data.writeUInt32BE(index, 33)
  }

  let I = crypto.hmacSHA512(this.chainCode, data)
  let IL = I.slice(0, 32)
  let IR = I.slice(32)

  // if parse256(IL) >= n, proceed with the next value for i
  if (!ecc.isPrivate(IL)) return this.derive(index + 1)

  // Private parent key -> private child key
  let hd
  if (!this.isNeutered()) {
    // ki = parse256(IL) + kpar (mod n)
    let ki = ecc.privateAdd(this.d, IL)

    // In case ki == 0, proceed with the next value for i
    if (ki == null) return this.derive(index + 1)

    hd = new BIP32(ki, null, IR, this.network)

  // Public parent key -> public child key
  } else {
    // Ki = point(parse256(IL)) + Kpar
    //    = G*IL + Kpar
    let Ki = ecc.pointAddScalar(this.Q, IL, true)

    // In case Ki is the point at infinity, proceed with the next value for i
    if (Ki === null) return this.derive(index + 1)

    hd = new BIP32(null, Ki, IR, this.network)
  }

  hd.depth = this.depth + 1
  hd.index = index
  hd.parentFingerprint = this.getFingerprint().readUInt32BE(0)
  return hd
}

let UINT31_MAX = Math.pow(2, 31) - 1
function UInt31 (value) {
  return typeforce.UInt32(value) && value <= UINT31_MAX
}

BIP32.prototype.deriveHardened = function (index) {
  typeforce(UInt31, index)

  // Only derives hardened private keys by default
  return this.derive(index + HIGHEST_BIT)
}

// Private === not neutered
// Public === neutered
BIP32.prototype.isNeutered = function () {
  return this.d === null
}

function BIP32Path (value) {
  return typeforce.String(value) && value.match(/^(m\/)?(\d+'?\/)*\d+'?$/)
}

BIP32.prototype.derivePath = function (path) {
  typeforce(BIP32Path, path)

  let splitPath = path.split('/')
  if (splitPath[0] === 'm') {
    if (this.parentFingerprint) throw new TypeError('Expected master, got child')

    splitPath = splitPath.slice(1)
  }

  return splitPath.reduce(function (prevHd, indexStr) {
    let index
    if (indexStr.slice(-1) === "'") {
      index = parseInt(indexStr.slice(0, -1), 10)
      return prevHd.deriveHardened(index)
    } else {
      index = parseInt(indexStr, 10)
      return prevHd.derive(index)
    }
  }, this)
}

BIP32.prototype.sign = function (hash) {
  return ecc.sign(hash, this.d)
}

BIP32.prototype.verify = function (hash, signature) {
  return ecc.verify(hash, this.Q, signature)
}

module.exports = {
  fromBase58,
  fromSeed
}
