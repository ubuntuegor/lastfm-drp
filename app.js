const http = require('http'),
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
    http.get(settings.lastfmBase+"?method=user.getrecenttracks&user="+settings.username+"&api_key="+settings.lastfmKey+"&format=json&limit=1", (res) => {
        var { statusCode } = res;
        if (statusCode !== 200) {
            console.error (`Request Failed.\nStatus Code: ${statusCode}`);
            // consume response data to free up memory
            res.resume();
            return;
        }

        res.setEncoding('utf8');
        var response = '';
        res.on('data', (chunk) => { response += chunk; });
        res.on('end', () => {
            try {
                var track = JSON.parse(response).recenttracks.track[0];
            } catch (e) {
                console.error(e.message);
            }
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
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
}
setInterval(update, settings.delay*1000);
console.log("Started");