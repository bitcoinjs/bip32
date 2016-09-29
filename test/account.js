var Account = require('../account')
var Chain = require('../chain')
// var bitcoinjs = require('bitcoinjs-lib')
var test = require('tape')

var f = require('./fixtures/account')
f.allAddresses = [].concat.apply([], f.addresses)

function blankAccount (json) {
  var account = Account.fromJSON(json)
  var chains = account.chains.map(function (chain) {
    return new Chain(chain.__parent, 0)
  })

  return new Account(chains)
}

test('containsAddress', function (t) {
  var account = Account.fromJSON(f.neutered.json)

  f.allAddresses.forEach(function (address) {
    t.equal(account.containsAddress(address), true, 'returns true for known chain address')
  })

  t.equal(account.containsAddress('mpFZW4A9QtRuSpuh9SmeW7RSzFE3TgB8Ko'), false, 'returns false for unknown address')
  t.end()
})

test('getAllAddresses', function (t) {
  var account = blankAccount(f.neutered.json)

  t.plan(2)
  t.equal(account.getAllAddresses().length, 2, 'returns only 2 addresses post-construction')

  // iterate the chains
  f.addresses.forEach(function (a, i) {
    for (var j = 1; j < a.length; ++j) account.nextChainAddress(i)
  })

  t.same(account.getAllAddresses(), f.allAddresses, 'returns all derived addresses')
})

test('getChainAddress', function (t) {
  var account = blankAccount(f.neutered.json)

  f.addresses.forEach(function (addresses, i) {
    addresses.forEach(function (address) {
      t.equal(account.getChainAddress(i), address, 'matches the latest chain address')
      account.nextChainAddress(i)
    })
  })

  t.end()
})

test('getNetwork', function (t) {
  var account = Account.fromJSON(f.neutered.json)

  t.plan(1)
  t.equal(account.getNetwork(), account.chains[0].__parent.keyPair.network, 'matches keyPair network')
})

test('isChainAddress', function (t) {
  var account = Account.fromJSON(f.neutered.json)

  f.addresses.forEach(function (addresses, i) {
    addresses.forEach(function (address) {
      t.equal(account.isChainAddress(i, address), true, 'for same chain')
      t.equal(account.isChainAddress(i === 1 ? 0 : 1, address), false, 'for different chains')
    })
  })

  t.end()
})

test('nextChainAddress', function (t) {
  var account = blankAccount(f.neutered.json)

  // returns the new address
  f.addresses.forEach(function (addresses, i) {
    // skip the first address
    addresses.slice(1).forEach(function (address, j) {
      t.equal(account.getChainAddress(i), addresses[j], 'is moving forward the chain')
      t.equal(account.nextChainAddress(i), address, 'returns the next address: ' + address)
    })
  })

  t.end()
})

test('getChains', function (t) {
  var account = blankAccount(f.neutered.json)

  t.plan(2)
  t.equal(account.getChains().length, 2, 'returns the expected number of chains')
  t.equal(account.getChains(), account.chains, 'matches internal .chains')
})

// TODO
test('discoverChain', function (t) {
  // .getChainAddress() should remain the same after a uneventful discovery
  // .getChainAddress() should change after an eventful discovery
  t.end()
})

test('getChildrenMap', function (t) {
  function jsonify (map) {
    for (var x in map) map[x] = map[x].toBase58()
    return map
  }

  var neutered = Account.fromJSON(f.neutered.json)

  t.test('neutered node', function (t) {
    f.addresses.forEach(function (addresses, i) {
      var actual = neutered.getChildrenMap(addresses)
      t.same(f.neutered.children[i], jsonify(actual), 'returns neutered children')
    })

    var emptyMap = neutered.getChildrenMap(['mpFZW4A9QtRuSpuh9SmeW7RSzFE3TgB8Ko'])
    t.same(emptyMap, {}, 'ignores unknown children')

    t.end()
  })

  var priv = Account.fromJSON(f.private.json)

  t.test('neutered node w/ escalation', function (t) {
    var privParents = priv.chains.map(function (x) {
      return x.__parent
    })

    f.addresses.forEach(function (addresses, i) {
      var actual = neutered.getChildrenMap(addresses, privParents)
      t.same(f.private.children[i], jsonify(actual), 'returns private children')
    })

    f.addresses.forEach(function (addresses, i) {
      var actual = neutered.getChildrenMap(addresses)
      t.same(f.neutered.children[i], jsonify(actual), 'still returns neutered children if no parameter provided')
    })

    var emptyMap = neutered.getChildrenMap(['mpFZW4A9QtRuSpuh9SmeW7RSzFE3TgB8Ko'], privParents)
    t.same(emptyMap, {}, 'ignores unknown children')

    t.end()
  })

  t.test('private node', function (t) {
    f.addresses.forEach(function (addresses, i) {
      var actual = priv.getChildrenMap(addresses)
      t.same(f.private.children[i], jsonify(actual), 'returns private children')
    })

    var emptyMap = priv.getChildrenMap(['mpFZW4A9QtRuSpuh9SmeW7RSzFE3TgB8Ko'])
    t.same(emptyMap, {}, 'ignores unknown children')

    t.end()
  })

  t.end()
})
