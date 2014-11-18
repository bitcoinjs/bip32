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
      assert.equal(account.getExternalAddress(), f.addresses[0])
      assert.equal(account.getInternalAddress(), f.changeAddresses[0])
    })

    it('can start at k-offset of 3', function() {
      account = new Account(external.neutered(), internal.neutered(), 3)

      assert.equal(account.k, 3)
      assert.equal(account.getExternalAddress(), f.addresses[3])
      assert.equal(account.getInternalAddress(), f.changeAddresses[3])
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

  describe('getExternalAddress', function() {
    it('returns the latest address', function() {
      f.addresses.forEach(function(address) {
        assert.equal(account.getExternalAddress(), address)

        account.nextAddress()
      })
    })
  })

  describe('getAllAddresses', function() {
    beforeEach(function() {
      for (var i = 1; i < f.addresses.length; ++i) account.nextAddress()
    })

    it('returns all known addresses from both chains', function() {
      assert.deepEqual(account.getAllAddresses(), allAddresses)
    })
  })

  describe('getInternalAddress', function() {
    it('returns the latest change address', function() {
      f.changeAddresses.forEach(function(address) {
        assert.equal(account.getInternalAddress(), address)

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

  describe('isInternalAddress', function() {
    beforeEach(function() {
      for (var i = 1; i < f.addresses.length; ++i) account.nextAddress()
    })

    it('returns true for internal addresses', function() {
      f.changeAddresses.forEach(function(address) {
        assert(account.isInternalAddress(address))
      })
    })

    it('returns false for external addresses', function() {
      f.addresses.forEach(function(address) {
        assert(!account.isInternalAddress(address))
      })
    })
  })

  describe('isExternalAddress', function() {
    beforeEach(function() {
      for (var i = 1; i < f.addresses.length; ++i) account.nextAddress()
    })

    it('returns true for external addresses', function() {
      f.addresses.forEach(function(address) {
        assert(account.isExternalAddress(address))
      })
    })

    it('returns false for internal addresses', function() {
      f.changeAddresses.forEach(function(address) {
        assert(!account.isExternalAddress(address))
      })
    })
  })

  describe('nextAddress', function() {
    it('iterates the external iterator', function() {
      f.addresses.forEach(function(address) {
        assert.equal(account.external.get(), address)

        account.nextAddress()
      })
    })

    it('iterates the internal iterator', function() {
      f.changeAddresses.forEach(function(address) {
        assert.equal(account.internal.get(), address)

        account.nextAddress()
      })
    })

    it('returns the new external address', function() {
      // skips the initial address
      f.addresses.slice(1).forEach(function(address) {
        assert.equal(account.nextAddress(), address)
      })
    })
  })
})
