function Chain (parent, k) {
  k = k || 0
  this.__parent = parent

  this.addresses = []
  this.k = k
  this.map = {}
}

Chain.prototype.__initialize = function () {
  var address = this.__parent.derive(this.k).getAddress()
  this.map[address] = this.k
  this.addresses.push(address)
}

Chain.prototype.find = function (address) {
  return this.map[address]
}

Chain.prototype.get = function () {
  if (this.addresses.length === 0) this.__initialize()

  return this.addresses[this.addresses.length - 1]
}

Chain.prototype.getAll = function () {
  if (this.addresses.length === 0) this.__initialize()

  return this.addresses
}

Chain.prototype.getParent = function () {
  return this.__parent
}

Chain.prototype.next = function () {
  if (this.addresses.length === 0) this.__initialize()
  var address = this.__parent.derive(this.k + 1).getAddress()

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
