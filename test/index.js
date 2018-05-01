let BIP32 = require('../')
let tape = require('tape')
let fixtures = require('./fixtures/index.json')
let LITECOIN = {
  wif: 0xb0,
  bip32: {
    public: 0x019da462,
    private: 0x019d9cfe
  }
}

let validAll = []
fixtures.valid.forEach(function (f) {
  f.master.network = f.network
  f.master.children = f.children
  f.master.comment = f.comment
  f.children.forEach(function (fc) {
    fc.network = f.network
    validAll.push(fc)
  })
  validAll.push(f.master)
})

function verify (t, hd, prv, f, network) {
  t.equal(hd.chainCode.toString('hex'), f.chainCode)
  t.equal(hd.depth, f.depth >>> 0)
  t.equal(hd.index, f.index >>> 0)
  t.equal(hd.getFingerprint().toString('hex'), f.fingerprint)
  t.equal(hd.getIdentifier().toString('hex'), f.identifier)
  t.equal(hd.getPublicKey().toString('hex'), f.pubKey)
  if (prv) t.equal(hd.toBase58(), f.base58Priv)
  if (prv) t.equal(hd.toWIF(), f.wif)
  if (!prv) t.throws(function () { hd.toWIF() }, /Missing private key/)
  if (!prv) t.equal(hd.d, null) // internal
  t.equal(hd.neutered().toBase58(), f.base58)
  t.equal(hd.isNeutered(), !prv)

  if (!f.children) return
  if (!prv && f.children.some(x => x.hardened)) return

  // test deriving path from master
  f.children.forEach((cf) => {
    let chd = hd.derivePath(cf.path)
    verify(t, chd, prv, cf, network)

    let chdNoM = hd.derivePath(cf.path.slice(2)) // no m/
    verify(t, chdNoM, prv, cf, network)
  })

  // test deriving path from successive children
  let shd = hd
  f.children.forEach((cf) => {
    if (cf.m === undefined) return
    if (cf.hardened) {
      shd = shd.deriveHardened(cf.m)
    } else {
      // verify any publicly derived children
      if (cf.base58) verify(t, shd.neutered().derive(cf.m), false, cf, network)

      shd = shd.derive(cf.m)
      verify(t, shd, prv, cf, network)
    }

    t.throws(function () {
      shd.derivePath('m/0')
    }, /Expected master, got child/)

    verify(t, shd, prv, cf, network)
  })
}

validAll.forEach(function (ff) {
  tape.test(ff.comment || ff.base58Priv, function (t) {
    let network
    if (ff.network === 'litecoin') network = LITECOIN

    let hd = BIP32.fromBase58(ff.base58Priv, network)
    verify(t, hd, true, ff, network)

    hd = BIP32.fromBase58(ff.base58, network)
    verify(t, hd, false, ff, network)

    if (ff.seed) {
      hd = BIP32.fromSeed(Buffer.from(ff.seed, 'hex'), network)
      verify(t, hd, true, ff, network)
    }

    t.end()
  })
})

tape.test('fromBase58 throws', function (t) {
  fixtures.invalid.fromBase58.forEach(function (f) {
    t.throws(function () {
      let network
      if (f.network === 'litecoin') network = LITECOIN

      BIP32.fromBase58(f.string, network)
    }, new RegExp(f.exception))
  })

  t.end()
})

tape.test('works for Private -> public (neutered)', function (t) {
  let f = fixtures.valid[1]
  let c = f.children[0]

  let master = BIP32.fromBase58(f.master.base58Priv)
  let child = master.derive(c.m).neutered()

  t.plan(1)
  t.equal(child.toBase58(), c.base58)
})

tape.test('works for Private -> public (neutered, hardened)', function (t) {
  let f = fixtures.valid[0]
  let c = f.children[0]

  let master = BIP32.fromBase58(f.master.base58Priv)
  let child = master.deriveHardened(c.m).neutered()

  t.plan(1)
  t.equal(c.base58, child.toBase58())
})

tape.test('works for Public -> public', function (t) {
  let f = fixtures.valid[1]
  let c = f.children[0]

  let master = BIP32.fromBase58(f.master.base58)
  let child = master.derive(c.m)

  t.plan(1)
  t.equal(c.base58, child.toBase58())
})

tape.test('throws on Public -> public (hardened)', function (t) {
  let f = fixtures.valid[0]
  let c = f.children[0]

  let master = BIP32.fromBase58(f.master.base58)

  t.plan(1)
  t.throws(function () {
    master.deriveHardened(c.m)
  }, /Missing private key for hardened child key/)
})

tape.test('throws on wrong types', function (t) {
  let f = fixtures.valid[0]
  let master = BIP32.fromBase58(f.master.base58)

  fixtures.invalid.derive.forEach(function (fx) {
    t.throws(function () {
      master.derive(fx)
    }, /Expected UInt32/)
  })

  fixtures.invalid.deriveHardened.forEach(function (fx) {
    t.throws(function () {
      master.deriveHardened(fx)
    }, /Expected UInt31/)
  })

  fixtures.invalid.derivePath.forEach(function (fx) {
    t.throws(function () {
      master.derivePath(fx)
    }, /Expected BIP32Path, got/)
  })

  t.end()
})

tape.test('works when private key has leading zeros', function (t) {
  let key = 'xprv9s21ZrQH143K3ckY9DgU79uMTJkQRLdbCCVDh81SnxTgPzLLGax6uHeBULTtaEtcAvKjXfT7ZWtHzKjTpujMkUd9dDb8msDeAfnJxrgAYhr'
  let hdkey = BIP32.fromBase58(key)

  t.plan(2)
  t.equal(hdkey.d.toString('hex'), '00000055378cf5fafb56c711c674143f9b0ee82ab0ba2924f19b64f5ae7cdbfd')
  let child = hdkey.derivePath('m/44\'/0\'/0\'/0/0\'')
  t.equal(child.d.toString('hex'), '3348069561d2a0fb925e74bf198762acc47dce7db27372257d2d959a9e6f8aeb')
})

/*
tape.test('fromSeed', function (t) {
  t.throws(function () {
    this.mock(BigInteger).expects('fromBuffer')
      .once().returns(BigInteger.ZERO)

    t.throws(function () {
      BIP32.fromSeed('ffffffffffffffffffffffffffffffff')
    }, /Private key must be greater than 0/)
  }, /ErrorXXX/, 'throws if IL is not within interval [1, n - 1] | IL === 0')

'throws if IL is not within interval [1, n - 1] | IL === n'
    this.mock(BigInteger).expects('fromBuffer')
      .once().returns(curve.n)

    t.throws(function () {
      BIP32.fromSeedHex('ffffffffffffffffffffffffffffffff')
    }, /Private key must be less than the curve order/)

'throws on low entropy seed'
    t.throws(function () {
      BIP32.fromSeedHex('ffffffffff')
    }, /Seed should be at least 128 bits/)

'throws on too high entropy seed'
    t.throws(function () {
      BIP32.fromSeedHex('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
    }, /Seed should be at most 512 bits/)

})

//  let hd = BIP32.fromSeed(Buffer.alloc(64))
//
//  tape.test('sign', function () {
//    this.mock(keyPair).expects('sign')
//      .once().withArgs(hash).returns('signed')
//
//    t.equal(hd.sign(hash), 'signed')
//  })
//
//  tape.test('verify', function (t) {
//    let signature = hd.sign(hash)
//
//    this.mock(keyPair).expects('verify')
//      .once().withArgs(hash, signature).returns('verified')
//
//    t.equal(hd.verify(hash, signature), 'verified')
//  })
*/
