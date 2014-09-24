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
    for (var i = 0; i < 14; ++i) {
      derived.push(hdNode.derive(i).getAddress().toString())
    }
  })

  describe('constructor', function() {
    it('defaults to k=0', function() {
      var iter = new AddressIterator(hdNode)

      assert.equal(iter.addresses.length, 1)
      assert.equal(iter.addresses[0], derived[0])
    })

    it('can start at an arbitrary k-offset', function() {
      var iter = new AddressIterator(hdNode, 2)

      assert.equal(iter.addresses.length, 1)
      assert.equal(iter.addresses[0], derived[2])
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
    it('shows the next address without mutation', function() {
      var iter = new AddressIterator(hdNode, 7)

      assert.equal(iter.get(), derived[7])
      assert.equal(iter.peek(), derived[8])
      assert.equal(iter.get(), derived[7])
    })
  })

  describe('indexOf', function() {
    it('works for k-index of 0', function() {
      var iter = new AddressIterator(hdNode, 0)
      var k = iter.indexOf(derived[0])

      assert.equal(k, 0)
    })

    it('finds the k-index for an Address', function() {
      var iter = new AddressIterator(hdNode, 0)
      for (var j = 0; j < 6; ++j) iter.next()

      var k = iter.indexOf(derived[4])

      assert.equal(k, 4)
    })

    it('finds the k-index for an Address (w/ offset)', function() {
      var iter = new AddressIterator(hdNode, 8)
      for (var j = 0; j < 6; ++j) iter.next()

      var k = iter.indexOf(derived[12])

      assert.equal(k, 12)
    })
  })
})
