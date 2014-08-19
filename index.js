// https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#account-discovery
function discovery(hdNode, gapLimit, queryCb, done) {
  var gap = 0
  var k = 0

  ;(function cycle() {
    var addresses = []

    for (var j = 0; j < gapLimit; ++j) {
      var address = hdNode.derive(k).getAddress().toString()

      addresses.push(address)
      k++
    }

    queryCb(addresses, function(err, results) {
      if (err) return done(err)

      results.forEach(function(isSpent) {
        if (isSpent) {
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

module.exports = {
  discovery: discovery
}
