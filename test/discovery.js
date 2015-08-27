/* global beforeEach describe it */

var assert = require('assert')
var bitcoinjs = require('bitcoinjs-lib')

var AddressIterator = require('../src/iterator')
var discovery = require('../src/discovery')

var fixtures = require('./fixtures/discovery')

describe('Discovery', function () {
  this.timeout(10000)

  fixtures.valid.forEach(function (f) {
    var iterator

    beforeEach(function () {
      var external = bitcoinjs.HDNode.fromBase58(f.external)

      iterator = new AddressIterator(external, f.k)
    })

    it('discovers until ' + f.expected.used + ' for ' + f.description + ' (GAP_LIMIT = ' + f.gapLimit + ')', function (done) {
      discovery(iterator, f.gapLimit, function (addresses, callback) {
        return callback(undefined, addresses.map(function (address) {
          return !!f.used[address]
        }))
      }, function (err, used, checked) {
        if (err) return done(err)

        assert.equal(used, f.expected.used)
        assert.equal(checked, f.expected.checked)

        var unused = checked - used
        for (var i = 1; i < unused; ++i) iterator.pop()

        assert.equal(iterator.get(), f.expected.nextToUse)

        return done()
      })
    })
  })
})
