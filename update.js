const DiscordRPC = require('discord-rpc'),
  rpc = new DiscordRPC.Client({ transport: 'ipc' }),
  settings = require('./config.json')

rpc.on('ready', () => {
  process.on('message', function (track) {
    rpc.setActivity(track)
  })
  process.send('started')
})

rpc.on('error', () => {
  process.send("can't connect")
})

rpc.login(settings.clientId)
