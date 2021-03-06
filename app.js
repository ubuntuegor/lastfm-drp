const http = require('http'),
  fork = require('child_process').fork,
  settings = require('./config.json')

var lastSongUrl = '0', childProc, delay = settings.delay, pausedCount = 0

function leadingZero (n) {
  return (n > 9) ? '' + n : '0' + n
}

function log (message) {
  var now = new Date()
  console.log(leadingZero(now.getHours()) + ':' + leadingZero(now.getMinutes()) + ':' + leadingZero(now.getSeconds()) + ' - ' + message)
}

function getPresence (track) {
  return {
    details: `🎵 ${track.name}`,
    state: `👤 ${track.artist['#text']}`,
    largeImageKey: settings.largeImageKey,
    smallImageKey: settings.smallImageKey,
    largeImageText: settings.username + ' is streaming',
    smallImageText: `💿 ${track.album['#text']}`,
    instance: false
  }
}

function update () {
  http.get(settings.lastfmBase + '?method=user.getrecenttracks&user=' + settings.username + '&api_key=' + settings.lastfmKey + '&format=json&limit=1', (res) => {
    var { statusCode } = res
    if (statusCode !== 200) {
      log(`Request Failed.\nStatus Code: ${statusCode}`)
      res.resume()
      return
    }

    res.setEncoding('utf8')
    var response = ''
    res.on('data', (chunk) => { response += chunk })
    res.on('end', () => {
      try {
        var track = JSON.parse(response).recenttracks.track[0]
      } catch (e) {
        log(e.message)
      }
      if (track['@attr'] && track['@attr'].nowplaying == 'true' && track.url != lastSongUrl) {
        if (!childProc || childProc.killed) {
          childProc = fork('update.js', [], {
            detached: true
          })
          childProc.on('message', function (m) {
            if (m == 'started') {
              sleepMode.stop()
              pausedCount = 0
              childProc.send(getPresence(track))
            }
            else if (m == "can't connect") pausedCount++
            else log(m)
          })
          childProc.on('exit', function () {
            log('Player stopped')
          })
        } else childProc.send(getPresence(track))
        log('Track updated: ' + track.artist['#text'] + ' - ' + track.name)
        lastSongUrl = track.url
      } else if (childProc && !childProc.killed && lastSongUrl != '0' && !track['@attr']) {
        childProc.kill()
        pausedCount++
        lastSongUrl = '0'
      } else if (!track['@attr']) {
        pausedCount++
      }
    })
  }).on('error', (e) => {
    log(`Last.FM API error: ${e.message}`)
    pausedCount++
  })
  if (pausedCount > 5) sleepMode.start()
  setTimeout (update, delay * 1000);
}

var sleepMode = {
  sleeping: false,
  start: function () {
    if (this.sleeping) return
    this.sleeping = true
    log ("Going to sleep mode")
    delay = 60
  },
  stop: function () {
    if (!this.sleeping) return
    this.sleeping = false
    log ("Exit sleep mode")
    delay = settings.delay
  }
}
update()
log('Started')
