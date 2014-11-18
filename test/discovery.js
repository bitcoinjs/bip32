var assert = require('assert')
var bitcoinjs = require('bitcoinjs-lib')
var discovery = require('../src/discovery')
var request = require('request')

var Helloblock = require('cb-helloblock')
var blockchain = new Helloblock('testnet')

// helper functions for tests
function fund(iNode, n, gapLimit, done) {
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

    var txb = new bitcoinjs.TransactionBuilder()
    txb.addInput(body.data.txHash, 0)

    var gap = 0
    for (var k = 1; k < n; ++k) {
      gap++

      var kAddress = iNode.derive(k).getAddress().toString()

      // skip 70% of addresses (but not the last)
      var underLimit = gap < gapLimit
      var notLast = k !== n - 1
      if (notLast && underLimit && (Math.random() > 0.3)) {
        continue
      }

      gap = 0
      txb.addOutput(kAddress, 1e3)
    }

    txb.sign(0, sourceNode.privKey)

    var tx = txb.build()
    console.warn('Used ' + tx.outs.length + ' addresses (' + source + ')')

    blockchain.transactions.propagate(tx.toHex(), function(err) {
      if (err) return done(err)

      done()
    })
  })
}

describe('Discovery', function() {
  this.timeout(9999999)

  var expected, wallet

  beforeEach(function(done) {
    expected = 100 + Math.ceil(Math.random() * 300)

    // Generate random Wallet
    wallet = new bitcoinjs.Wallet(undefined, bitcoinjs.networks.testnet)

    console.warn('Initializing Wallet w/ ' + expected + ' addresses')
    fund(wallet.getExternalAccount(), expected, 20, done)
  })

  it('discovers a funded Wallet correctly (GAP_LIMIT = 20)', function(done) {
    discovery(wallet.getExternalAccount(), 20, function(addresses, callback) {
      blockchain.addresses.summary(addresses, function(err, results) {
        if (err) return callback(err)

        var areUsed = results.map(function(result) {
          return result.totalReceived > 0
        })

        callback(undefined, areUsed)
      })
    }, function(err, n) {
      assert.ifError(err)

      console.warn('Discovered ' + n + ' addresses')

      assert.ifError(err)
      assert.equal(n, expected)

      done()
    })
  })

  it('allows discovery from an arbitrary k-offset', function(done) {
    var k = 50

    discovery(wallet.getExternalAccount(), 20, k, function(addresses, callback) {
      blockchain.addresses.summary(addresses, function(err, results) {
        if (err) return callback(err)

        var areUsed = results.map(function(result) {
          return result.totalReceived > 0
        })

        callback(undefined, areUsed)
      })
    }, function(err, n) {
      assert.ifError(err)

      console.warn('Discovered ' + n + ' addresses')

      assert.ifError(err)
      assert.equal(n, expected - k)

      done()
    })
  })
})
