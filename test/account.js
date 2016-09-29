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

// TODO: getChains
// TODO
test('discoverChain', function (t) {
  // .getChainAddress() should remain the same after a uneventful discovery
  // .getChainAddress() should change after an eventful discovery
  t.end()
})

test('getChildrenMap', function (t) {
  function jsonify (map) {
    for (var x in map) map[x] = map[x].toBase58()
  }

  t.test('neutered node', function (t) {
    var neutered = Account.fromJSON(f.neutered.json)

    f.addresses.forEach(function (addresses, i) {
      var actual = jsonify(neutered.getChildrenMap(addresses))
      t.same(f.children, actual, 'returns neutered children')
    })

    var emptyMap = neutered.getChildrenMap(['mpFZW4A9QtRuSpuh9SmeW7RSzFE3TgB8Ko'])
    t.same(emptyMap, {}, 'ignores unknown children')

    t.end()
  })

  t.test('private node', function (t) {
    var priv = Account.fromJSON(f.private.json)

    f.addresses.forEach(function (addresses, i) {
      var actual = jsonify(priv.getChildrenMap(addresses))
      t.same(f.children, actual, 'returns private children')
    })

    var emptyMap = priv.getChildrenMap(['mpFZW4A9QtRuSpuh9SmeW7RSzFE3TgB8Ko'])
    t.same(emptyMap, {}, 'ignores unknown children')

    t.end()
  })

  t.end()
})
