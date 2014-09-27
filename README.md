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

    var areSpent = results.map(function(result) {
      return result.totalReceived > 0
    })

    callback(undefined, areSpent)
  })
}, function(err, k) {
  if (err) throw err

  console.warn('Discovered ' + k + ' addresses to be in use...')
})
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
