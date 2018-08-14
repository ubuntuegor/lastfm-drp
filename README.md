# Last.FM Discord Rich Presence
Initially made to show now playing track from Google Play Music, using [scroblr](http://scroblr.fm/).<br>
You can [create your own app](https://discordapp.com/developers/applications/me) to use it for your needs.

![alt text](example.png "Using for Google Play Music")

GPM preset:
```
    "clientId": "422710601538732033",
    "smallImageKey": "play",
    "largeImageKey": "gpm",
```
<br>
Deezer preset:
```
    "clientId": "435033457190633475",
    "smallImageKey": "play",
    "largeImageKey": "deezer",
```

# How to use
1. Download this repository.
2. Install dependencies `npm install`.
3. Modify config.json.
4. Run `npm start`.
# Run in background
1. Install PM2 `npm install pm2 -g`
2. Run `pm2 start app.js --name="lastfm-drp"`
