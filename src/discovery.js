// https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#account-discovery
module.exports = function discovery(iterator, gapLimit, queryCb, done) {
  var gap = 0
  var n = 0

  ;(function cycle() {
    for (var j = 0; j < gapLimit; ++j) {
      iterator.next()

      n++
    }

    var addresses = iterator.addresses.slice(-gapLimit)

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
        var used = n - gap

        return done(undefined, used, n)
      }

      cycle()
    })
  })()
}
