var AddressIterator = require('./iterator')

function Account(external, internal, k) {
  this.external = new AddressIterator(external, k)
  this.internal = new AddressIterator(internal, k)
}

Account.prototype.containsAddress = function(address) { return this.isExternalAddress(address) || this.isInternalAddress(address) }
Account.prototype.getAllAddresses = function() { return this.external.addresses.concat(this.internal.addresses) }
Account.prototype.getExternalAddress = function() { return this.external.get() }
Account.prototype.getInternalAddress = function() { return this.internal.get() }
Account.prototype.getNetwork = function() { return this.external.node.network }
Account.prototype.getNode = function(address, external, internal) {
  return this.getNodes([address], external, internal)[0]
}
Account.prototype.getNodes = function(addresses, external, internal) {
  external = external || this.external.node
  internal = internal || this.internal.node

  var externalIter = this.external
  var internalIter = this.internal

  return addresses.map(function(address) {
    var k

    if (address in externalIter.map) {
      k = externalIter.map[address]

      return external.derive(k)
    }

    if (address in internalIter.map) {
      k = internalIter.map[address]

      return internal.derive(k)
    }

    throw new Error(address + ' not found')
  })
}

Account.prototype.isExternalAddress = function(address) { return address in this.external.map }
Account.prototype.isInternalAddress = function(address) { return address in this.internal.map }

Account.prototype.nextExternalAddress = function() { return this.external.next() }
Account.prototype.nextInternalAddress = function() { return this.internal.next() }

module.exports = Account
