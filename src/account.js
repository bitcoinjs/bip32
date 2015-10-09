function Account (chains) {
  this.chains = chains
}

Account.prototype.containsAddress = function (address) {
  return this.chains.some(function (chain) {
    return chain.find(address) !== undefined
  })
}

Account.prototype.getAllAddresses = function () {
  return [].concat.apply([], this.chains.map(function (chain) {
    return chain.getAll()
  }))
}

Account.prototype.getChain = function (i) { return this.chains[i] }
Account.prototype.getChains = function () { return this.chains }
Account.prototype.getChainAddress = function (i) { return this.chains[i].get() }
Account.prototype.getNetwork = function () { return this.chains[0].getParent().keyPair.network }
Account.prototype.getChildren = function (addresses, parents) {
  var chains = this.chains

  return addresses.map(function (address) {
    for (var i = 0; i < chains.length; ++i) {
      var chain = chains[i]
      var node = (parents && parents[i]) || chains[i].getParent()
      var k = chain.find(address)

      if (k !== undefined) return node.derive(k)
    }

    throw new Error(address + ' not found')
  })
}

Account.prototype.isChainAddress = function (i, address) {
  return this.chains[i].find(address) !== undefined
}
Account.prototype.nextChainAddress = function (i) {
  return this.chains[i].next()
}

module.exports = Account
