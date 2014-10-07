var assert = require('assert')
var bitcoinjs = require('bitcoinjs-lib')

var Account = require('../src/account')

var fixtures = require('./fixtures/account')

describe('Account', function() {
  var external, internal
  var account, f
  var allAddresses

  beforeEach(function() {
    f = fixtures.valid[0]

    external = bitcoinjs.HDNode.fromBase58(f.external)
    internal = bitcoinjs.HDNode.fromBase58(f.internal)
    account = new Account(external.neutered(), internal.neutered())

    allAddresses = f.addresses.concat(f.changeAddresses)
  })

  describe('constructor', function() {
    it('generates addresses for k=0', function() {
      assert.equal(account.getAddress(), f.addresses[0])
      assert.equal(account.getChangeAddress(), f.changeAddresses[0])
    })
  })

  describe('addresses', function() {
    beforeEach(function() {
      for (var i = 1; i < f.addresses.length; ++i) account.nextAddress()
    })

    it('returns all known addresses from both chains', function() {
      assert.deepEqual(account.addresses, allAddresses)
    })
  })

  // TODO
  describe.skip('k', function() {
  })

  describe('containsAddress', function() {
    beforeEach(function() {
      for (var i = 1; i < f.addresses.length; ++i) account.nextAddress()
    })

    it('returns true for known addresses', function() {
      f.addresses.forEach(function(address) {
        assert(account.containsAddress(address))
      })
    })

    it('returns false for unknown addresses', function() {
      assert(!account.containsAddress('mpFZW4A9QtRuSpuh9SmeW7RSzFE3TgB8Ko'))
    })
  })

  describe('getAddress', function() {
    it('returns the latest address', function() {
      f.addresses.forEach(function(address) {
        assert.equal(account.getAddress(), address)

        account.nextAddress()
      })
    })
  })

  describe('getChangeAddress', function() {
    it('returns the latest change address', function() {
      f.changeAddresses.forEach(function(address) {
        assert.equal(account.getChangeAddress(), address)

        account.nextAddress()
      })
    })
  })

  describe('getNodes', function() {
    beforeEach(function() {
      for (var i = 1; i < f.addresses.length; ++i) account.nextAddress()
    })

    it('returns the corresponding children nodes', function() {
      var nodes = account.getNodes(allAddresses)
      var actual = nodes.map(function(node) {
        return node.getAddress().toString()
      })

      assert.deepEqual(actual, allAddresses)
    })

    it('returns private nodes if non-neutered external/internal nodes are supplied', function() {
      var nodes = account.getNodes(allAddresses, external, internal)
      var actual = nodes.map(function(node) {
        return node.privKey.toWIF().toString()
      })

      assert.deepEqual(actual, f.privateKeys)
    })

    it('throws if address is not known', function() {
      assert.throws(function() {
        account.getNodes(['mpFZW4A9QtRuSpuh9SmeW7RSzFE3TgB8Ko'])
      }, /mpFZW4A9QtRuSpuh9SmeW7RSzFE3TgB8Ko not found/)
    })
  })

  // TODO
  describe.skip('nextAddress', function() {
  })
})
