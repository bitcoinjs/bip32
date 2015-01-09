var assert = require('assert')
var bitcoinjs = require('bitcoinjs-lib')

var Account = require('../src/account')
var AddressIterator = require('../src/iterator')
var discovery = require('../src/discovery')

var fixtures = require('./fixtures/discovery')

describe('Discovery', function() {
  this.timeout(10000)

  fixtures.valid.forEach(function(f) {
    var account, iterator

    beforeEach(function() {
      var external = bitcoinjs.HDNode.fromBase58(f.external)
      var internal = bitcoinjs.HDNode.fromBase58(f.internal)

      account = new Account(external, internal)
      iterator = new AddressIterator(external, f.k)
    })

    it('discovers until ' + f.expected.lastChecked + ' for ' + f.description + ' (GAP_LIMIT = ' + f.gapLimit + ')', function(done) {
      discovery(iterator, f.gapLimit, function(addresses, callback) {
        return callback(undefined, addresses.map(function(address) {
          return !!f.used[address]
        }))
      }, function(err, used, checked) {
        if (err) return done(err)

        assert.equal(used, f.expected.used)
        assert.equal(iterator.get(), f.expected.lastChecked)
        assert.equal(checked, f.expected.checked)

        for (var i = 0; i < (checked - used); ++i) {
          iterator.pop()
        }

        assert.equal(iterator.get(), f.expected.nextToUse)

        return done()
      })
    })
  })
})
