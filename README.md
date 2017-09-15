# bip32-utils

[![TRAVIS](https://secure.travis-ci.org/bitcoinjs/bip32-utils.png)](http://travis-ci.org/bitcoinjs/bip32-utils)
[![NPM](http://img.shields.io/npm/v/bip32-utils.svg)](https://www.npmjs.org/package/bip32-utils)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

A set of utilities for working with BIP32.
Compatible with bitcoinjs-lib `^2.0.0` and `^3.0.0`.


## Example

#### BIP32 Account
``` javascript
var bitcoin = require('bitcoinjs-lib')
var bip32utils = require('bip32-utils')

// ...

var m = bitcoin.HDNode.fromSeedHex(seedHex)
var i = m.deriveHardened(0)
var external = i.derive(0)
var internal = i.derive(1)
var account = new bip32utils.Account([
  new bip32utils.Chain(external.neutered()),
  new bip32utils.Chain(internal.neutered())
])

console.log(account.getChainAddress(0))
// => 1QEj2WQD9vxTzsGEvnmLpvzeLVrpzyKkGt

account.nextChainAddress(0)

console.log(account.getChainAddress(1))
// => 1DAi282VN7Ack9o5BqWYkiEsS8Vgx1rLn

console.log(account.getChainAddress(1))
// => 1CXKM323V3kkrHmZQYPUTftGh9VrAWuAYX

console.log(account.derive('1QEj2WQD9vxTzsGEvnmLpvzeLVrpzyKkGt'))
// => xpub6A5Fz4JZg4kd8pLTTaMBKsvVgzRBrvai6ChoxWNTtYQ3UDVG1VyAWQqi6SNqkpsfsx9F8pRqwtKUbU4j4gqpuN2gpgQs4DiJxsJQvTjdzfA

// NOTE: passing in the parent nodes allows for private key escalation (see xprv vs xpub)

console.log(account.derive('1QEj2WQD9vxTzsGEvnmLpvzeLVrpzyKkGt', [external, internal]))
// => xprv9vodQPEygdPGUWeKUVNd6M2N533PvEYP21tYxznauyhrYBBCmdKxRJzmnsTsSNqfTJPrDF98GbLCm6xRnjceZ238Qkf5GQGHk79CrFqtG4d
```


#### BIP32 Chains
``` javascript
var bitcoin = require('bitcoinjs-lib')
var bip32utils = require('bip32-utils')

// ...

var hdNode = bitcoin.HDNode.fromSeedHex(seedHex)
var chain = new bip32utils.Chain(hdNode)

for (var k = 0; k < 10; ++k) chain.next()

var address = chain.get()

console.log(chain.find(address))
// => 9

console.log(chain.pop())
// => address
```


#### BIP32 Discovery (manual)
``` javascript
var bip32utils = require('bip32-utils')
var bitcoin = require('bitcoinjs-lib')
var Blockchain = require('cb-blockr')

// ...

var blockchain = new Blockchain('testnet')
var hdNode = bitcoin.HDNode.fromSeedHex(seedHex)
var chain = bip32utils.Chain(hdNode)
var GAP_LIMIT = 20

bip32utils.discovery(chain, GAP_LIMIT, function(addresses, callback) {
  blockchain.addresses.summary(addresses, function(err, results) {
    if (err) return callback(err)

    var areUsed = results.map(function(result) {
      return result.totalReceived > 0
    })

    callback(undefined, areUsed)
  })
}, function(err, used, checked) {
  if (err) throw err

  console.log('Discovered at most ' + used + ' used addresses')
  console.log('Checked ' + checked + ' addresses')
  console.log('With at least ' + (checked - used) + ' unused addresses')

  // throw away ALL unused addresses AFTER the last unused address
  var unused = checked - used
  for (var i = 1; i < unused; ++i) chain.pop()

  // remember used !== total, chain may have started at a k-index > 0
  console.log('Total number of addresses (after prune): ', chain.addresses.length)
})
```


## LICENSE [MIT](LICENSE)
