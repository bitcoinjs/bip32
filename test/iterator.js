var assert = require('assert')
var bitcoin = require('bitcoinjs-lib')

var AddressIterator = require('../src/iterator')

var fixtures = require('./fixtures/iterator')

describe('AddressIterator', function() {
  fixtures.valid.forEach(function(f) {
    var node

    beforeEach(function() {
      node = bitcoin.HDNode.fromBase58(f.node)
    })

    describe('constructor', function() {
      it('defaults to k=0', function() {
        var iter = new AddressIterator(node)

        assert.equal(iter.k, 0)
      })

      it('can start at k-offset of ' + f.k, function() {
        var iter = new AddressIterator(node, f.k)

        assert.equal(iter.k, f.k)
        assert.deepEqual(iter.addresses, f.addresses.slice(-1))
      })
    })

    describe('get', function() {
      var iter

      beforeEach(function() {
        iter = new AddressIterator(node, f.k)
        iter.addresses = f.addresses
      })

      it('returns the last address', function() {
        assert.equal(iter.get(), f.addresses[f.addresses.length - 1])
      })
    })

    describe('next', function() {
      var iter, last2

      beforeEach(function() {
        iter = new AddressIterator(node, f.k - 1)
        last2 = f.addresses.slice(-2)
      })

      it('iterates to the next address', function() {
        assert.equal(iter.get(), last2[0])
        iter.next()

        assert.equal(iter.get(), last2[1])
      })

      it('returns the new address', function() {
        assert.equal(iter.next(), last2[1])
      })
    })

    describe('peek', function() {
      var iter

      beforeEach(function() {
        iter = new AddressIterator(node, f.k)
      })

      it('shows the next address', function() {
        var last = iter.get()
        iter.k -= 1 // reverse the state a little

        assert.equal(iter.peek(), last)
      })

      it('does not mutate', function() {
        iter.peek()

        assert.deepEqual(iter.addresses, f.addresses.slice(-1))
        assert.equal(iter.k, f.k)
      })
    })

    describe('pop', function() {
      var iter, last2

      beforeEach(function() {
        iter = new AddressIterator(node, f.k - 1)
        iter.next()

        last2 = f.addresses.slice(-2)
      })

      it('pops the last address', function() {
        assert.equal(iter.get(), last2[1])
        iter.pop()

        assert.equal(iter.get(), last2[0])
      })

      it('returns the popped address', function() {
        assert.equal(iter.pop(), last2[1])
      })
    })
  })
})
