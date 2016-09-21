/* global beforeEach describe it */

var assert = require('assert')
var bitcoin = require('bitcoinjs-lib')

var Chain = require('../src/chain')

var fixtures = require('./fixtures/chain')

describe('Chain', function () {
  fixtures.valid.forEach(function (f) {
    var node

    beforeEach(function () {
      node = bitcoin.HDNode.fromBase58(f.node)
    })

    describe('constructor', function () {
      it('defaults to k=0', function () {
        var chain = new Chain(node)

        assert.equal(chain.k, 0)
      })

      it('can start at k=' + f.k, function () {
        var chain = new Chain(node, f.k)

        assert.equal(chain.k, f.k)
      })

      it('is lazy', function () {
        var chain = new Chain(node, f.k)

        assert.equal(chain.addresses.length, 0)
      })
    })

    describe('clone', function () {
      it('performs a deep copy (except for __parent)', function () {
        var chain = new Chain(node)
        var clone = chain.clone()

        // by reference
        assert.strictEqual(chain.__parent, clone.__parent)

        // by value
        assert.strictEqual(chain.k, clone.k)
        assert.notStrictEqual(chain.addresses, clone.addresses)
        assert.notStrictEqual(chain.map, clone.map)

        chain.addresses[100] = true
        assert.strictEqual(clone.addresses[100], undefined)
      })
    })

    describe('get', function () {
      var chain

      beforeEach(function () {
        chain = new Chain(node, f.k)
        chain.addresses = f.addresses
      })

      it('returns the last address', function () {
        assert.equal(chain.get(), f.addresses[f.addresses.length - 1])
      })
    })

    describe('next', function () {
      var chain, last2

      beforeEach(function () {
        chain = new Chain(node, f.k - 1)
        last2 = f.addresses.slice(-2)
      })

      it('generates the next address', function () {
        assert.equal(chain.get(), last2[0])
        chain.next()

        assert.equal(chain.get(), last2[1])
      })

      it('returns the new address', function () {
        assert.equal(chain.next(), last2[1])
      })
    })

    describe('pop', function () {
      var chain, last2

      beforeEach(function () {
        chain = new Chain(node, f.k - 1)
        chain.next()

        last2 = f.addresses.slice(-2)
      })

      it('pops the last address', function () {
        assert.equal(chain.get(), last2[1])
        chain.pop()

        assert.equal(chain.get(), last2[0])
      })

      it('returns the popped address', function () {
        assert.equal(chain.pop(), last2[1])
      })
    })
  })
})
