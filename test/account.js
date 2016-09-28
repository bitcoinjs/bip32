var Account = require('../account')
var Chain = require('../chain')
var bitcoinjs = require('bitcoinjs-lib')
var test = require('tape')

var fixtures = require('./fixtures/account')
var fixtures2 = require('./fixtures/accounts')

function blankAccount () {
  var account = Account.fromJSON(fixtures.json)
  var chains = account.chains.map(function (chain) {
    return new Chain(chain.__parent, 0)
  })

  return new Account(chains)
}

test('containsAddress', function (t) {
  var account = Account.fromJSON(fixtures.json)

  fixtures.addresses.forEach(function (address) {
    t.equal(account.containsAddress(address), true, 'returns true for known address')
  })

  t.equal(account.containsAddress('mpFZW4A9QtRuSpuh9SmeW7RSzFE3TgB8Ko'), false, 'returns false for unknown address')
  t.end()
})

test('getAllAddresses', function (t) {
  var account = blankAccount()

  t.plan(2)
  t.equal(account.getAllAddresses().length, 2, 'returns only 2 addresses post-construction')

  // iterate to n addresses
  for (var i = 1; i < fixtures.addresses.length / 2; ++i) {
    account.nextChainAddress(0)
    account.nextChainAddress(1)
  }

  t.same(account.getAllAddresses(), fixtures.addresses, 'returns all derived addresses')
})

test('getChainAddress', function (t) {
  var account = blankAccount()

  fixtures.json.forEach(function (chain, i) {
    for (var address in chain.map) {
      t.equal(account.getChainAddress(i), address, 'matches the latest chain address')
      account.nextChainAddress(i)
    }
  })

  t.end()
})

test('getNetwork', function (t) {
  var account = Account.fromJSON(fixtures.json)

  t.plan(1)
  t.equal(account.getNetwork(), account.chains[0].__parent.keyPair.network, 'matches keyPair network')
})

test('isChainAddress', function (t) {
  var account = Account.fromJSON(fixtures.json)

  fixtures.json.forEach(function (chain, i) {
    for (var address in chain.map) {
      t.equal(account.isChainAddress(i, address), true, 'for same chain')
      t.equal(account.isChainAddress(i === 1 ? 0 : 1, address), false, 'for different chains')
    }
  })

  t.end()
})

test('nextChainAddress', function (t) {
  var account = blankAccount()

  // matches the internal chain
  fixtures.json.forEach(function (chain, i) {
    for (var address in chain.map) {
      t.equal(account.chains[i].get(), address, 'matches the internal chain: ' + address)
      account.nextChainAddress(i)
    }
  })

  account = blankAccount()

  // returns the new address
  fixtures.json.forEach(function (chain, i) {
    var addresses = Object.keys(chain.map)

    // skip the first address
    addresses.slice(1).forEach(function (address) {
      t.equal(account.nextChainAddress(i), address, 'returns the next address: ' + address)
    })
  })

  t.end()
})

// TODO
test('discoverChain', function (t) {
  // .getChainAddress() should remain the same after a uneventful discovery
  // .getChainAddress() should change after an eventful discovery
  t.end()
})

test('getChildrenMap', function (t) {
  var account = Account.fromJSON(fixtures.json)
  var childrenMap = account.getChildrenMap(fixtures.addresses)

  // convert to JSON
  for (var address in childrenMap) {
    childrenMap[address] = childrenMap[address].toBase58()
  }

  t.plan(2)
  t.same(fixtures.children, childrenMap, 'returns known children')

  var emptyMap = account.getChildrenMap(['mpFZW4A9QtRuSpuh9SmeW7RSzFE3TgB8Ko'])
  t.same(emptyMap, {}, 'ignores unknown children')
})

// verify *JSON functions
fixtures2.forEach(function (f) {
  var network = bitcoinjs.networks[f.network]
  var account = Account.fromJSON(f.json, network)

  test('fromJSON imports ' + f.seed.slice(0, 20) + '...', function (t) {
    f.json.forEach(function (jc, i) {
      var chain = account.getChain(i)

      t.same(chain.map, jc.map, 'k map matches')
      t.equal(Object.keys(jc.map).every(function (address) {
        return chain.addresses.indexOf(address) !== -1
      }), true, 'imported every address')
    })
    t.end()
  })

  test('toJSON exports ' + f.seed.slice(0, 20) + '...', function (t) {
    t.plan(1)
    t.same(account.toJSON(), f.json)
  })
})

