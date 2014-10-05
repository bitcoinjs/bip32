# bip32-utils

[![build status](https://secure.travis-ci.org/dcousens/bip32-utils.png)](http://travis-ci.org/dcousens/bip32-utils)
[![Coverage Status](https://img.shields.io/coveralls/dcousens/bip32-utils.svg)](https://coveralls.io/r/dcousens/bip32-utils)
[![Version](http://img.shields.io/npm/v/bip32-utils.svg)](https://www.npmjs.org/package/bip32-utils)


## Examples

BIP32 [Used] Address discovery

``` javascript
var bip32utils = require('bip32-utils')
var bitcoin = require('bitcoinjs-lib')
var Helloblock = require('cb-helloblock')

// ...

var blockchain = new Helloblock('testnet')
var hdNode = bitcoin.HDNode.fromSeedHex(seedHex)
var GAP_LIMIT = 20

bip32utils.discovery(hdNode, GAP_LIMIT, function(addresses, callback) {
  blockchain.addresses.summary(addresses, function(err, results) {
    if (err) return callback(err)

    var areUsed = results.map(function(result) {
      return result.totalReceived > 0
    })

    callback(undefined, areUsed)
  })
}, function(err, k) {
  if (err) throw err

  console.warn('Discovered ' + k + ' addresses to be in use...')
})
```


BIP32 Account
``` javascript
var bitcoin = require('bitcoinjs-lib')
var bip32utils = require('bip32-utils')

// ...

var hdNode = bitcoin.HDNode.fromSeedHex(seedHex)
var external = hdNode.derive(0)
var internal = hdNode.derive(1)
var account = new bip32utils.Account(external.neutered(), internal.neutered())

console.log(account.getAddress())
// => 1QEj2WQD9vxTzsGEvnmLpvzeLVrpzyKkGt

account.nextAddress()

console.log(account.getAddress())
// => 1DAi282VN7Ack9o5BqWYkiEsS8Vgx1rLn

console.log(account.getChangeAddress())
// => 1CXKM323V3kkrHmZQYPUTftGh9VrAWuAYX

console.log(account.getNodes(account.addresses).join(' '))
// => xpub6A5Fz4JZg4kd8pLTTaMBKsvVgzRBrvai6ChoxWNTtYQ3UDVG1VyAWQqi6SNqkpsfsx9F8pRqwtKUbU4j4gqpuN2gpgQs4DiJxsJQvTjdzfA ...

console.log(account.getNodes(account.addresses, internal, external).join(' '))
// => xprv9vodQPEygdPGUWeKUVNd6M2N533PvEYP21tYxznauyhrYBBCmdKxRJzmnsTsSNqfTJPrDF98GbLCm6xRnjceZ238Qkf5GQGHk79CrFqtG4d ...
```


BIP32 Address iteration

``` javascript
var bitcoin = require('bitcoinjs-lib')
var bip32utils = require('bip32-utils')

// ...

var hdNode = bitcoin.HDNode.fromSeedHex(seedHex)
var iter = new bip32utils.AddressIterator(hdNode)

for (var k = 0; k < 10; ++k) iter.next()

var address = iter.get()

console.log(iter.indexOf(address))
// => 9
```
