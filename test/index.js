var assert = require('assert')
var bip32utils = require('../index.js')
var bitcoinjs = require('bitcoinjs-lib')
var request = require('request')

var Helloblock = require('cb-helloblock')
var blockchain = new Helloblock('testnet')

// helper functions for tests
function fund(iNode, n, done) {
  var sourceNode = iNode.derive(0)
  var source = sourceNode.getAddress().toString()

  request.post({
    url: "https://testnet.helloblock.io/v1/faucet/withdrawal",
    json: true,
    form: {
      toAddress: source,
      value: 2e3 * n
    }
  }, function(err, res, body) {
    if (err) return done(err)

    var tx = new bitcoinjs.Transaction()
    tx.addInput(body.data.txHash, 0)

    for (var k = 1; k < n; ++k) {
      var kAddress = iNode.derive(k).getAddress()

      // skip 30% of addresses
      if (Math.random() < 0.7) {
        tx.addOutput(kAddress, 1e3)
      }
    }

    console.warn('Used ' + tx.outs.length + ' addresses (' + source + ')')

    tx.sign(0, sourceNode.privKey)
    blockchain.transactions.propagate([tx.toHex()], function(err) {
      if (err) return done(err)

      done()
    })
  })
}

describe('BIP32-utils', function() {
  describe('Discovery', function() {
    this.timeout(0)

    var expected, wallet

    beforeEach(function(done) {
      // Generate random Wallet
      expected = 50 + Math.ceil(Math.random() * 300)
      wallet = new bitcoinjs.Wallet(undefined, bitcoinjs.networks.testnet)

      console.warn('Initializing Wallet w/ ' + expected + ' used addresses')
      fund(wallet.getExternalAccount(), expected, done)
    })

    it('discovers a funded Wallet correctly (GAP_LIMIT = 20)', function(done) {
      bip32utils.discovery(wallet.getExternalAccount(), 20, function(addresses, callback) {
        blockchain.addresses.summary(addresses, function(err, results) {
          if (err) return callback(err)

          var areSpent = results.map(function(result) {
            return result.totalReceived > 0
          })

          callback(undefined, areSpent)
        })
      }, function(err, k) {
        if (err) return done(err)

        console.warn('Discovered ' + k + ' addresses')

        assert.ifError(err)
        assert.equal(k, expected)

        done()
      })
    })
  })
})
