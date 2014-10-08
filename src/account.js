var AddressIterator = require('./iterator')

function Account(external, internal) {
  this.external = new AddressIterator(external)
  this.internal = new AddressIterator(internal)
}

Object.defineProperty(Account.prototype, 'k', {
  get: function() {
    return this.external.k
  }
})

Account.prototype.containsAddress = function(address) {
  return (address in this.external.map) || (address in this.internal.map)
}

Account.prototype.getAddress = function() { return this.external.get() }
Account.prototype.getAddresses = function() {
  return this.external.addresses.concat(this.internal.addresses)
}
Account.prototype.getChangeAddress = function() { return this.internal.get() }
Account.prototype.getNodes = function(addresses, external, internal) {
  external = external || this.external.hdNode
  internal = internal || this.internal.hdNode

  return addresses.map(function(address) {
    var k

    if (address in this.external.map) {
      k = this.external.indexOf(address)

      return external.derive(k)
    }

    if (address in this.internal.map) {
      k = this.internal.indexOf(address)

      return internal.derive(k)
    }

    throw new Error(address + ' not found')
  }, this)
}

Account.prototype.nextAddress = function() {
  this.external.next()
  this.internal.next()
}

module.exports = Account
