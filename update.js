const DiscordRPC = require('discord-rpc'),
    rpc = new DiscordRPC.Client({ transport: 'ipc' }),
    settings = require('./config.json');

rpc.on('ready', () => {
    process.on("message", function(track){
        rpc.setActivity(track);
    });
    process.send("started");
});

rpc.login(settings.clientId);