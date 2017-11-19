function DEFAULT_ADDRESS_FUNCTION (node) {
  return node.getAddress()
}

function Chain (parent, k, addressFunction) {
  k = k || 0
  this.__parent = parent

  this.addresses = []
  this.addressFunction = addressFunction || DEFAULT_ADDRESS_FUNCTION
  this.k = k
  this.map = {}
}

Chain.prototype.__initialize = function () {
  var address = this.addressFunction(this.__parent.derive(this.k))
  this.map[address] = this.k
  this.addresses.push(address)
}

Chain.prototype.clone = function () {
  var chain = new Chain(this.__parent, this.k, this.addressFunction)

  chain.addresses = this.addresses.concat()
  for (var s in this.map) chain.map[s] = this.map[s]

  return chain
}

Chain.prototype.derive = function (address, parent) {
  var k = this.map[address]
  if (k === undefined) return

  parent = parent || this.__parent
  return parent.derive(k)
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
  var address = this.addressFunction(this.__parent.derive(this.k + 1))

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
