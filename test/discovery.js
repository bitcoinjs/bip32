var assert = require('assert')
var bitcoinjs = require('bitcoinjs-lib')

var Account = require('../src/account')
var AddressIterator = require('../src/iterator')
var Blockchain = require('cb-helloblock')
var discovery = require('../src/discovery')

var fixtures = require('./fixtures/discovery')

describe('Discovery', function() {
  this.timeout(9999999)

  var blockchain

  beforeEach(function() {
    blockchain = new Blockchain('testnet')
  })

  fixtures.valid.forEach(function(f) {
    var account, iterator

    beforeEach(function() {
      var external = bitcoinjs.HDNode.fromBase58(f.external)
      var internal = bitcoinjs.HDNode.fromBase58(f.internal)

      account = new Account(external, internal)
      iterator = new AddressIterator(external, f.k)
    })

    it('discovers a funded Account correctly (GAP_LIMIT = ' + f.gapLimit + ')', function(done) {
      discovery(iterator, f.gapLimit, function(addresses, callback) {
        blockchain.addresses.summary(addresses, function(err, results) {
          if (err) return callback(err)

          var areUsed = results.map(function(result) {
            return result.totalReceived > 0
          })

          return callback(undefined, areUsed)
        })
      }, function(err, n, k) {
        if (err) return done(err)

        assert.equal(n, f.expected.n)
        assert.equal(k, f.expected.k)

        return done()
      })
    })
  })
})
