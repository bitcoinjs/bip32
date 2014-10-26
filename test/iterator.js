var assert = require('assert')
var bitcoin = require('bitcoinjs-lib')

var AddressIterator = require('../src/iterator')

var fixtures = require('./fixtures/iterator')

function copy(a) { return JSON.parse(JSON.stringify(a)) }

describe('AddressIterator', function() {
  fixtures.valid.forEach(function(f) {
    describe('constructor', function() {
      var node

      beforeEach(function() {
        node = bitcoin.HDNode.fromBase58(f.node)
      })

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

    describe('fromJSON', function() {
      var iter

      beforeEach(function() {
        iter = AddressIterator.fromJSON(copy(f))
      })

      it('imports from JSON as expected', function() {
        assert.deepEqual(iter.addresses, f.addresses)
        assert.deepEqual(iter.k, f.k)
        assert.deepEqual(iter.map, f.map)
        assert.deepEqual(iter.node.toBase58(), f.node)
      })
    })

    describe('get', function() {
      var iter

      beforeEach(function() {
        iter = AddressIterator.fromJSON(copy(f))
      })

      it('returns the last address', function() {
        assert.equal(iter.get(), f.addresses[f.addresses.length - 1])
      })
    })

    describe('next', function() {
      var iter, node

      beforeEach(function() {
        node = bitcoin.HDNode.fromBase58(f.node)
        iter = new AddressIterator(node, f.k - (f.addresses.length - 1))
      })

      it('iterates to the next address', function() {
        assert.equal(iter.get(), f.addresses[0])
        iter.next()

        assert.equal(iter.get(), f.addresses[1])
      })

      it('returns the new address', function() {
        assert.equal(iter.next(), f.addresses[1])
      })
    })

    describe('peek', function() {
      var iter

      beforeEach(function() {
        iter = AddressIterator.fromJSON(copy(f))
      })

      it('shows the next address', function() {
        iter.k -= 1 // reverse the state a little
        iter.addresses.pop()

        assert.equal(iter.peek(), f.addresses[f.addresses.length - 1])
      })

      it('does not mutate', function() {
        iter.peek()

        assert.deepEqual(iter.toJSON(), f)
      })
    })

    describe('toJSON', function() {
      var iter

      beforeEach(function() {
        iter = AddressIterator.fromJSON(copy(f))
      })

      it('outputs the correct JSON object', function() {
        assert.deepEqual(iter.toJSON(), f)
      })
    })
  })
})
