// https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#account-discovery
module.exports = function discovery(iterator, gapLimit, queryCb, done) {
  var gap = 0
  var checked = 0

  ;(function cycle() {
    var batch = [iterator.get()]
    checked++

    while (batch.length < gapLimit) {
      iterator.next()
      batch.push(iterator.get())

      checked++
    }

    queryCb(batch, function(err, results) {
      if (err) return done(err)

      results.forEach(function(isUsed) {
        if (isUsed) {
          gap = 0

        } else {
          gap += 1

        }
      })

      if (gap >= gapLimit) {
        var used = checked - gap

        return done(undefined, used, checked)

      } else {
        iterator.next()
      }

      cycle()
    })
  })()
}
