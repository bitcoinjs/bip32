/* global beforeEach describe it */

var assert = require('assert')
var bitcoinjs = require('bitcoinjs-lib')

var Account = require('../src/account')
var Chain = require('../src/chain')
var fixtures = require('./fixtures/account')
var fixtures2 = require('./fixtures/schemas')

var NETWORKS = bitcoinjs.networks

describe('Account', function () {
  var account, parents, f

  beforeEach(function () {
    f = fixtures.valid[0]
    parents = [
      bitcoinjs.HDNode.fromBase58(f.external),
      bitcoinjs.HDNode.fromBase58(f.internal)
    ]
    var chains = parents.map(function (node) {
      return new Chain(node.neutered())
    })

    account = new Account(chains)
  })

  describe('containsAddress', function () {
    beforeEach(function () {
      for (var i = 1; i < f.addresses.length; ++i) {
        account.nextChainAddress(0)
        account.nextChainAddress(1)
      }
    })

    it('returns true for known addresses', function () {
      f.addresses.forEach(function (address) {
        assert(account.containsAddress(address))
      })
    })

    it('returns false for unknown addresses', function () {
      assert(!account.containsAddress('mpFZW4A9QtRuSpuh9SmeW7RSzFE3TgB8Ko'))
    })
  })

  describe('getAllAddresses', function () {
    it('returns all known addresses from both chains', function () {
      for (var i = 1; i < f.addresses.length; ++i) {
        account.nextChainAddress(0)
        account.nextChainAddress(1)
      }

      var allAddresses = f.addresses.concat(f.changeAddresses)

      assert.deepEqual(account.getAllAddresses(), allAddresses)
    })

    it('returns 2 addresses after construction', function () {
      assert.equal(account.getAllAddresses().length, 2)
    })
  })

  describe('getChainAddress', function () {
    it('returns the latest address on chain i', function () {
      f.addresses.forEach(function (address) {
        assert.equal(account.getChainAddress(0), address)

        account.nextChainAddress(0)
      })

      f.changeAddresses.forEach(function (address) {
        assert.equal(account.getChainAddress(1), address)

        account.nextChainAddress(1)
      })
    })
  })

  describe('getNetwork', function () {
    it('returns the chain:0\'s network', function () {
      assert.equal(account.getNetwork(), parents[0].keyPair.network)
    })
  })

  describe('getChildren', function () {
    beforeEach(function () {
      for (var i = 1; i < f.addresses.length; ++i) {
        account.nextChainAddress(0)
        account.nextChainAddress(1)
      }
    })

    it('returns the corresponding children nodes', function () {
      var allAddresses = f.addresses.concat(f.changeAddresses)
      var nodes = account.getChildren(allAddresses)
      var actual = nodes.map(function (node) {
        return node.getAddress()
      })

      assert.deepEqual(actual, allAddresses)
    })

    it('returns derivation of parent nodes (for private key escalation) if given', function () {
      var allAddresses = f.addresses.concat(f.changeAddresses)
      var nodes = account.getChildren(allAddresses, parents)
      var actual = nodes.map(function (node) { return node.toBase58() })

      assert.deepEqual(actual, f.children)
    })

    it('throws if address is not known', function () {
      assert.throws(function () {
        account.getChildren(['mpFZW4A9QtRuSpuh9SmeW7RSzFE3TgB8Ko'])
      }, /mpFZW4A9QtRuSpuh9SmeW7RSzFE3TgB8Ko not found/)
    })
  })

  describe('isChainAddress', function () {
    beforeEach(function () {
      for (var i = 1; i < f.addresses.length; ++i) {
        account.nextChainAddress(0)
        account.nextChainAddress(1)
      }
    })

    it('returns true for same-chain addresses', function () {
      f.addresses.forEach(function (address) {
        assert(account.isChainAddress(0, address))
      })
    })

    it('returns false for different-chain addresses', function () {
      f.changeAddresses.forEach(function (address) {
        assert(!account.isChainAddress(0, address))
      })
    })
  })

  describe('nextChainAddress', function () {
    it('progresses the i\'th chain', function () {
      f.changeAddresses.forEach(function (address) {
        assert.equal(account.chains[1].get(), address)

        account.nextChainAddress(1)
      })
    })

    it('returns the new internal address', function () {
      // next skips the initial address
      f.changeAddresses.slice(1).forEach(function (address) {
        assert.equal(account.nextChainAddress(1), address)
      })
    })
  })

  function assertChainEqual (json, chain) {
    Object.keys(json.map).forEach(function (address) {
      assert(chain.addresses.indexOf(address) !== -1, address)
    })
    assert.equal(chain.map, json.map)
  }

  fixtures2.forEach(function (f) {
    var network = NETWORKS[f.network]
    var account = Account.fromJSON(f.json, network)

    it('fromJSON imports ' + f.seed.slice(0, 20) + '...', function () {
      f.json.forEach(function (jc, i) {
        assertChainEqual(jc, account.chains[i])
      })
    })

    it('toJSON exports ' + f.seed.slice(0, 20) + '...', function () {
      assert.deepEqual(account.toJSON(), f.json)
    })
  })
})
