const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const webSocketServer = require('ws').Server;
const wss = new webSocketServer({port : 8080});
const fs = require('fs');
const db = require('./db.js');

const app = express();

const jsonParser = bodyParser.json({type : 'application/*'});

app.use(express.static(path.join(__dirname, 'public')));

app.all('/v1/newplayer/:name/:score?', jsonParser, async function(req, res) {
    console.log(req.path + " request (from " + req.ip + ")");
    const players = await db.getPlayers();
    if (players.find(function(player) {
            return player.name === req.params.name;
        })) {
        res.json(
            {rc : -1, msg : "Player '" + req.params.name + "' already exists"});
    } else {
        await db.registerPlayer(req.params.name, req.params.score || 0);
        const players = await db.getPlayers();
        tellAll("players", players);
        res.json({rc: 0});
    }
});

app.all('/v1/players', async function(req, res) {
    const players = await db.getPlayers();
    res.json(players);
});


function tellAll(type, dataObj)
{
    const msg = JSON.stringify({type: type, data: dataObj});
    for (var i = 0; i < clients.length; i++) {
        try {
            clients[i].send(msg);
            console.log("Sent " + msg + " to " + clients[i].name);
        } catch (err) {
            console.log("Failed to update client '" + clients[i].name + "': " + err);
        }
    }
}

var clientSeqCounter = 0;
var clients = [];

wss.on('connection', async function(ws, req) {

    ws.address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    ws.id = clientSeqCounter;
    ws.name = "[" + ws.id + "]";

    clients.push(ws);
    clientSeqCounter += 1;

    console.log("New WS connection (" + ws.name +
                "). Total connections: " + clients.length);

    const players = await db.getPlayers();
    ws.send(JSON.stringify({type : "players", data : players}));

    ws.on('message', function(msg) { console.log(ws.name + " says: " + msg); });
    ws.on('close', function() { console.log(ws.name + " closed"); });
});

app.listen(3000);
