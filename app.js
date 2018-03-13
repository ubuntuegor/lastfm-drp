const request = require('request'),
    fork = require('child_process').fork,
    settings = require('./config.json');

var lastSongUrl = "0", childProc;

function getPresence(track){
    return {
        details: `🎵 ${track.name}`,
        state: `👤 ${track.artist["#text"]}`,
        largeImageKey: settings.largeImageKey,
        smallImageKey: settings.smallImageKey,
        largeImageText: settings.username+" is streaming",
        smallImageText: `💿 ${track.album["#text"]}`,
        instance: false
    };
}

function update(){
    request(settings.lastfmBase+"?method=user.getrecenttracks&user="+settings.username+"&api_key="+settings.lastfmKey+"&format=json&limit=1", function (error, response, body) {
        if (error){
            console.error(error);
            return;
        }
        var track = JSON.parse(body).recenttracks.track[0];
        if (track["@attr"]&&track["@attr"].nowplaying=="true"&&track.url!=lastSongUrl){
            if (!childProc||childProc.killed) {
                childProc = fork('update.js', [], {
                    detached: true
                  });
                childProc.on("message", function(m){
                	if (m=="started") childProc.send(getPresence(track));
                	else console.log(m);
                });
                childProc.on("exit", function(){
                	console.log("Player stopped");
                });
            }
            else childProc.send(getPresence(track));
       		console.log("Track updated: "+ track.artist["#text"]+" - "+track.name);
            lastSongUrl = track.url;
        }
        else if (childProc&&!childProc.killed&&lastSongUrl!="0"&&!track["@attr"]) {
            childProc.kill();
            lastSongUrl = "0";
        }
    });
}
setInterval(update, settings.delay*1000);
console.log("Started");