var assert = require('assert')
var bip32utils = require('../index.js')
var bitcoinjs = require('bitcoinjs-lib')
var request = require('request')

var Helloblock = require('cb-helloblock')

// helper functions for tests
function fund(hdNode, n, done) {
  var k = 0

  ;(function cycle() {
    if (k === n) return done()

    var address = hdNode.derive(k).getAddress().toString()
    k += 1

    console.warn('> Funding', address)

    request.post({
      url: "https://testnet.helloblock.io/v1/faucet/withdrawal",
      json: true,
      form: {
        toAddress: address,
        value: 2e4
      }
    }, function(err, res, body) {
      if (err) return done(err)

      cycle()
    })
  })()
}

describe('BIP32-utils', function() {
  describe('Discovery', function() {
    this.timeout(0)

    var blockchain, expected, wallet

    beforeEach(function(done) {
      blockchain = new Helloblock('testnet')

      // Generate random Wallet
      wallet = new bitcoinjs.Wallet(undefined, bitcoinjs.networks.testnet)
      expected = Math.ceil(Math.random() * 7)

      console.warn('Initializing Wallet')
      fund(wallet.getExternalAccount(), expected, done)
    })

    it('discovers a funded Wallet correctly (GAP_LIMIT = 3)', function(done) {
      bip32utils.discovery(wallet.getExternalAccount(), 3, function(addresses, callback) {
        blockchain.addresses.get(addresses, function(err, results) {
          if (err) return callback(err)

          var areSpent = results.map(function(result) {
            return result.totalReceived > 0
          })

          callback(undefined, areSpent)
        })
      }, function(err, k) {
        if (err) return done(err)

        assert.ifError(err)
        assert.equal(k, expected)

        done()
      })
    })
  })
})
