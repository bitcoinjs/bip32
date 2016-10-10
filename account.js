var bitcoinjs = require('bitcoinjs-lib')
var discovery = require('./discovery')

var Chain = require('./chain')

function Account (chains) {
  this.chains = chains
}

Account.fromJSON = function (json, network) {
  var chains = json.map(function (j) {
    var node = bitcoinjs.HDNode.fromBase58(j.node, network)

    var chain = new Chain(node, j.k)
    chain.map = j.map

    // derive from k map
    chain.addresses = Object.keys(chain.map).sort(function (a, b) {
      return chain.map[a] - chain.map[b]
    })

    return chain
  })

  return new Account(chains)
}

Account.prototype.containsAddress = function (address) {
  return this.chains.some(function (chain) {
    return chain.find(address) !== undefined
  })
}

Account.prototype.discoverChain = function (i, gapLimit, queryCallback, callback) {
  var chains = this.chains
  var chain = chains[i].clone()

  discovery(chain, gapLimit, queryCallback, function (err, used, checked) {
    if (err) return callback(err)

    // throw away EACH unused address AFTER the last unused address
    var unused = checked - used
    for (var j = 1; j < unused; ++j) chain.pop()

    // override the internal chain
    chains[i] = chain

    callback()
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

// optional parents argument for private key escalation
Account.prototype.getChildrenMap = function (addresses, parents) {
  var chains = this.chains
  var children = {}

  addresses.forEach(function (address) {
    if (children[address]) return

    chains.some(function (chain, i) {
      var derived = chain.derive(address, parents && parents[i])
      if (!derived) return false

      children[address] = derived
      return true
    })
  })

  return children
}

Account.prototype.isChainAddress = function (i, address) {
  return this.chains[i].find(address) !== undefined
}

Account.prototype.nextChainAddress = function (i) {
  return this.chains[i].next()
}

Account.prototype.toJSON = function () {
  return this.chains.map(function (chain) {
    return {
      k: chain.k,
      map: chain.map,
      node: chain.getParent().toBase58()
    }
  })
}

module.exports = Account
