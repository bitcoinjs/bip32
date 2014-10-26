var bitcoin = require('bitcoinjs-lib')

function AddressIterator(node, k) {
  k = k || 0

  this.addresses = []
  this.k = k - 1
  this.map = {}
  this.node = node

  // iterate to k:0
  this.next()
}

AddressIterator.fromJSON = function(json) {
  var j = JSON.parse(json)
  var node = bitcoin.HDNode.fromBase58(j.node)

  var iter = new AddressIterator(node, j.k)
  iter.addresses = j.addresses
  iter.map = j.map

  return iter
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

AddressIterator.prototype.toJSON = function() {
  return {
    addresses: this.addresses,
    k: this.k,
    map: this.map,
    node: this.node.toBase58()
  }
}

module.exports = AddressIterator
