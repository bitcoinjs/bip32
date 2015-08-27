var xtend = require('xtend')

function Chain (node, k) {
  k = k || 0

  this.addresses = []
  this.k = k
  this.map = {}
  this.node = node
}

Chain.prototype.get = function () {
  if (this.addresses.length === 0) {
    var address = this.derive(this.k).getAddress().toString()
    this.map[address] = this.k
    this.addresses.push(address)

    return address
  }

  return this.addresses[this.addresses.length - 1]
}

Chain.prototype.find = function (address) {
  return this.map[address]
}

Chain.prototype.derive = function (k) {
  return this.node.derive(k)
}

Chain.prototype.escalated = function (node) {
  var chain = new Chain(node)

  chain.addresses = chain.addresses.concat()
  chain.k = this.k
  chain.map = xtend({}, this.map)

  return chain
}

Chain.prototype.neutered = function () {
  var chain = new Chain(this.node.neutered())

  chain.addresses = chain.addresses.concat()
  chain.k = this.k
  chain.map = xtend({}, this.map)

  return chain
}

Chain.prototype.next = function () {
  var address = this.derive(this.k + 1).getAddress().toString()

  this.k += 1
  this.map[address] = this.k
  this.addresses.push(address)

  return address
}

Chain.prototype.pop = function () {
  var address = this.addresses.pop()
  delete this.map[address]
  this.k -= 1

  return address
}

module.exports = Chain
