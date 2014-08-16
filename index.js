// https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#account-discovery
module.exports = function(hdNode, blockchain, gapLimit, done) {
  var gap = 0
  var k = 0

  ;(function cycle() {
    var addresses = []

    for (var j = 0; j < gapLimit; ++j) {
      var address = hdNode.derive(k).getAddress().toString()

      addresses.push(address)
      k++
    }

    blockchain.addresses.get(addresses, function(err, results) {
      if (err) return done(err)

      results.forEach(function(result) {
        if (result.totalReceived) {
          gap = 0

        } else {
          gap += 1

        }
      })

      if (gap > gapLimit) {
        // return the total number of used addresses
        return done(undefined, k - gap)
      }

      cycle()
    })
  })()
}
