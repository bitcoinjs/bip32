/* global beforeEach describe it */

var assert = require('assert')
var bitcoinjs = require('bitcoinjs-lib')

var Chain = require('../src/chain')
var discovery = require('../src/discovery')

var fixtures = require('./fixtures/discovery')

describe('Discovery', function () {
  this.timeout(10000)

  fixtures.valid.forEach(function (f) {
    var chain

    beforeEach(function () {
      var external = bitcoinjs.HDNode.fromBase58(f.external)

      chain = new Chain(external, f.k)
    })

    it('discovers until ' + f.expected.used + ' for ' + f.description + ' (GAP_LIMIT = ' + f.gapLimit + ')', function (done) {
      discovery(chain, f.gapLimit, function (addresses, callback) {
        return callback(undefined, addresses.map(function (address) {
          return !!f.used[address]
        }))
      }, function (err, used, checked) {
        if (err) return done(err)

        assert.equal(used, f.expected.used)
        assert.equal(checked, f.expected.checked)

        var unused = checked - used
        for (var i = 1; i < unused; ++i) chain.pop()

        assert.equal(chain.get(), f.expected.nextToUse)

        return done()
      })
    })
  })
})
