var bitcoinjs = require('bitcoinjs-lib')
var Chain = require('../chain')
var discovery = require('../discovery')
var test = require('tape')

var fixtures = require('./fixtures/discovery')

fixtures.valid.forEach(function (f) {
  var network = bitcoinjs.networks[f.network]
  var external = bitcoinjs.HDNode.fromBase58(f.external, network)
  var chain = new Chain(external, f.k)

  test('discovers until ' + f.expected.used + ' for ' + f.description + ' (GAP_LIMIT = ' + f.gapLimit + ')', function (t) {
    discovery(chain, f.gapLimit, function (addresses, callback) {
      return callback(null, addresses.map(function (address) {
        return !!f.used[address]
      }))
    }, function (err, used, checked) {
      t.plan(4)
      t.ifErr(err, 'no error')
      t.equal(used, f.expected.used, 'used as expected')
      t.equal(checked, f.expected.checked, 'checked count as expected')

      var unused = checked - used
      for (var i = 1; i < unused; ++i) chain.pop()

      t.equal(chain.get(), f.expected.nextToUse, 'next address to use matches')
    })
  })

  test('discover calls done on error', function (t) {
    var _err = new Error('e')

    discovery(chain, f.gapLimit, function (addresses, callback) {
      return callback(_err)
    }, function (err) {
      t.plan(1)
      t.equal(_err, err, 'error was returned as expected')
    })
  })
})
