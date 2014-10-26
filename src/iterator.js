function AddressIterator(node, k) {
  k = k || 0

  this.addresses = []
  this.k = k - 1
  this.map = {}
  this.node = node

  // iterate to k:0
  this.next()
}

AddressIterator.prototype.get = function() {
  return this.addresses[this.addresses.length - 1]
}

AddressIterator.prototype.indexOf = function(address) {
  return (address in this.map) ? this.map[address] : -1
}

AddressIterator.prototype.next = function() {
  var address = this.peek()
  this.k += 1

  // address indexed k map
  this.map[address] = this.k

  // k indexed address array
  this.addresses.push(address)

  return this.get()
}

AddressIterator.prototype.peek = function() {
  var xpub = this.node.derive(this.k + 1)

  return xpub.getAddress().toString()
}

module.exports = AddressIterator
