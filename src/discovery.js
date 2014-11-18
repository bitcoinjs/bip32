// https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#account-discovery
module.exports = function discovery(hdNode, gapLimit, k, queryCb, done) {
  if ("function" === typeof k) {
    done = queryCb
    queryCb = k
    k = 0
  }

  var gap = 0
  var n = 0

  ;(function cycle() {
    var addresses = []

    for (var j = 0; j < gapLimit; ++j) {
      var address = hdNode.derive(k + n).getAddress().toString()

      addresses.push(address)
      n++
    }

    queryCb(addresses, function(err, results) {
      if (err) return done(err)

      results.forEach(function(isUsed) {
        if (isUsed) {
          gap = 0

        } else {
          gap += 1

        }
      })

      if (gap >= gapLimit) {
        // return the total number of used addresses
        return done(undefined, n - gap)
      }

      cycle()
    })
  })()
}
