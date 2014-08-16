var assert = require('assert')
var bitcoinjs = require('bitcoinjs-lib')
var discover = require('../index.js')

var Helloblock = require('cb-helloblock')

function fund(hdNode, n, done) {
  var helloblock = require('helloblock-js')({
    network: 'testnet'
  })

  var k = 0
  ;(function cycle() {
    if (k === n) return done()

    var addr = hdNode.derive(k).getAddress().toString()

    helloblock.faucet.withdraw(addr, 2e4, function(err) {
      if (err) return done(err)
      k += 1

//      console.warn('... funding', addr)

      cycle()
    })
  })()
}

describe('Discover', function() {
  this.timeout(40000)

  var blockchain, expected, wallet

  beforeEach(function(done) {
    blockchain = new Helloblock('testnet')

    // Generate random Wallet
    wallet = new bitcoinjs.Wallet(undefined, bitcoinjs.networks.testnet)
    expected = Math.ceil(Math.random() * 6)

    fund(wallet.getExternalAccount(), expected, done)
  })

  it('Discovers a funded Wallet correctly (GAP_LIMIT = 3)', function(done) {
    // attempt blind discovery
    discover(wallet.getExternalAccount(), blockchain, 3, function(err, result) {
      assert.ifError(err)
      assert.equal(result, expected)

      done()
    })
  })
})
