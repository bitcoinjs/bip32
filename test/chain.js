var bitcoin = require('bitcoinjs-lib')
var Chain = require('../chain')
var test = require('tape')
var fixtures = require('./fixtures/chain')

fixtures.forEach(function (f) {
  var node = bitcoin.HDNode.fromBase58(f.node)

  test('constructor', function (t) {
    var chain = new Chain(node)

    t.plan(3)
    t.equal(chain.k, 0, 'defaults to k=0')

    chain = new Chain(node, f.k)
    t.equal(chain.k, f.k, 'can start at a custom k value')

    chain = new Chain(node, f.k)
    t.equal(chain.addresses.length, 0, 'is lazy')
  })

  test('clone', function (t) {
    var chain = new Chain(node)
    var clone = chain.clone()

    t.plan(15)

    // by reference
    t.equal(chain.__parent, clone.__parent, 'same parent')

    // by value
    t.equal(chain.k, clone.k, 'k copied')
    t.notEqual(chain.addresses, clone.addresses, 'address arrays are different objects')
    t.same(chain.addresses, clone.addresses, 'address arrays are deep copied')
    t.notEqual(chain.map, clone.map, 'k maps are different objects')
    t.same(chain.map, clone.map, 'k map is deep copied')

    for (var i = 0; i < 7; ++i) chain.next()
    t.equal(clone.k, 0, 'k unchanged by mutation')
    t.notEqual(chain.k, clone.k, 'k unchanged by mutation (2)')
    t.notSame(chain.addresses, clone.addresses, 'address array unchanged by mutation')
    t.notSame(chain.map, clone.map, 'k map unchanged by mutation')

    // re-clone
    clone = chain.clone()

    // re-verify
    t.equal(chain.k, clone.k, 'k copied')
    t.notEqual(chain.addresses, clone.addresses, 'address arrays are different objects')
    t.same(chain.addresses, clone.addresses, 'address arrays are deep copied')
    t.notEqual(chain.map, clone.map, 'k maps are different objects')
    t.same(chain.map, clone.map, 'k map is deep copied')
  })

  test('get', function (t) {
    var chain = new Chain(node, f.k)
    chain.addresses = f.addresses

    t.plan(1)
    t.equal(chain.get(), f.addresses[f.addresses.length - 1], 'returns the last address')
  })

  test('find/derive', function (t) {
    var neutered = node.neutered()
    var chain = new Chain(neutered, f.k)

    t.plan(30)
    for (var i = 0; i < 10; ++i) {
      var address = chain.get()

      t.equal(chain.find(address), f.k + i)
      t.same(chain.derive(address), neutered.derive(f.k + i))
      t.same(chain.derive(address, node), node.derive(f.k + i))
      chain.next()
    }
  })

  test('next', function (t) {
    var chain = new Chain(node, f.k - f.addresses.length + 1)
    var first3 = f.addresses.slice(0, 3)

    t.plan(3)
    t.equal(chain.get(), first3[0], 'before next, get the first address')
    chain.next()
    t.equal(chain.get(), first3[1], 'after next, get returns next address')
    t.equal(chain.next(), first3[2], 'returns the next address')
  })

  test('pop', function (t) {
    var chain = new Chain(node)
    chain.next()
    chain.next()
    var addresses = chain.getAll().concat()

    t.plan(8)
    t.equal(chain.getAll().length, 3, 'has 3 addresses')
    t.equal(chain.get(), addresses[2], 'matches the last address')
    chain.pop()
    t.equal(chain.getAll().length, 2, 'is now 1 less')
    t.equal(chain.get(), addresses[1], 'after pop, matches the second last')
    t.equal(chain.pop(), addresses[1], 'returns the popped address')
    t.equal(chain.getAll().length, 1, 'is now 1 less')
    t.equal(chain.pop(), addresses[0], 'returns the popped address')
    t.equal(chain.pop(), undefined, 'returns undefined when empty')
  })
})
