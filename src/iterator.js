function AddressIterator(hdNode, k) {
  k = k || 0

  // k-indexed address array
  this.addresses = []

  // address-indexed k map
  this.map = {}

  this.hdNode = hdNode
  this.k = k - 1

  // iterate to k:0
  this.next()
}

AddressIterator.prototype.get = function() {
  return this.addresses[this.addresses.length - 1]
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
  var xpub = this.hdNode.derive(this.k + 1)

  return xpub.getAddress().toString()
}

AddressIterator.prototype.indexOf = function(address) {
  return (address in this.map) ? this.map[address] : -1
}

module.exports = AddressIterator
