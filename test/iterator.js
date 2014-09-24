var assert = require('assert')
var bitcoinjs = require('bitcoinjs-lib')

var AddressIterator = require('../src/iterator')

describe('AddressIterator', function() {
  var derived, hdNode

  beforeEach(function() {
    var seed = new Buffer(16)
    seed.fill(1)

    hdNode = bitcoinjs.HDNode.fromSeedBuffer(seed)

    derived = []
    for (var i = 0; i < 20; ++i) derived.push(hdNode.derive(i).getAddress().toString())
  })

  describe('constructor', function() {
    it('defaults to k=0', function() {
      var iter = new AddressIterator(hdNode)

      assert.equal(iter.addresses.length, 1)
      assert.equal(iter.addresses[0], derived[0])
    })

    it('can start other k offsets', function() {
      var iter = new AddressIterator(hdNode, 5)

      assert.equal(iter.addresses.length, 1)
      assert.equal(iter.addresses[0], derived[5])
    })
  })

  describe('get', function() {
    var iter
    beforeEach(function() {
      iter = new AddressIterator(hdNode, 3)
    })

    it('returns the last address', function() {
      iter.next()

      assert.equal(iter.addresses.length, 2)
      assert.equal(iter.get(), iter.addresses[1])
    })
  })

  describe('next', function() {
    var iter
    beforeEach(function() {
      iter = new AddressIterator(hdNode, 3)
    })

    it('iterates to the next address', function() {
      assert.equal(iter.get(), derived[3])
      iter.next()

      assert.equal(iter.get(), derived[4])
    })

    it('adds the address to .addresses', function() {
      assert.equal(iter.addresses.length, 1)
      iter.next()

      assert.equal(iter.addresses.length, 2)
    })

    it('returns the new address', function() {
      assert.equal(iter.next(), derived[4])
    })
  })

  describe('peek', function() {
    var iter
    beforeEach(function() {
      iter = new AddressIterator(hdNode, 3)
    })

    it('shows the next address without mutation', function() {
      assert.equal(iter.get(), derived[3])
      var result = iter.peek()

      assert.equal(result, derived[4])
      assert.equal(iter.get(), derived[3])
    })
  })

  describe('indexes', function() {
    var iter
    beforeEach(function() {
      iter = new AddressIterator(hdNode, 0)

      for (var j = 0; j < 20; ++j) iter.next()
    })

    it('finds the k-indexes for an array of addresses', function() {
      var ks = iter.indexes(derived.slice(16))
      var expected = derived.map(function(address, k) {
        return { address: address, k: k }
      })

      assert.deepEqual(ks, expected.slice(16))
    })

    it('skips addresses not found', function() {
      var ks = iter.indexes(['foobar', 'fizzbuzz', '1DZcPM5RbSpoZdPif951fdTMNMgf7GXSUZ'])

      assert.deepEqual(ks, [{
        address: '1DZcPM5RbSpoZdPif951fdTMNMgf7GXSUZ',
        k: 4
      }])
    })
  })
})
