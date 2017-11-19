const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const webSocketServer = require('ws').Server;
const wss = new webSocketServer({port : 8080});
const fs = require('fs');

const app = express();

const players = [
    {id : 0, name : "Olle", score : 10}, {id : 1, name : "Erka", score : 1},
    {id : 2, name : "Ludde", score : 7}
];

const jsonParser = bodyParser.json({type : 'application/*'});

app.use(express.static(path.join(__dirname, 'public')));
app.all('/v1/newplayer/:name/:score?', jsonParser, function(req, res) {
    console.log(req.path + " request (from " + req.ip + ")");
    if (players.find(function(player) {
            return player.name === req.params.name;
        })) {
        res.json(
            {rc : -1, msg : "Player '" + req.params.name + "' already exists"});
    } else {
        newPlayer(req.params.name, req.params.score);
        res.json(players);
    }
});

var clientSeqCounter = 0;
var clients = [];

function newPlayer(name, initialScore)
{
    const player = {
        id : players.length,
        name : name,
        score : initialScore || 0
    };
    console.log("Add new player: " + JSON.stringify(player));
    players.push(player);

    for (var i = 0; i < clients.length; i++) {
        clients[i].send(JSON.stringify({type : "players", data : players}));
    }
}

wss.on('connection', function(ws, req) {
    const remoteAddress =
        req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    ws.address = remoteAddress;
    ws.id = clientSeqCounter;
    ws.name = "[" + ws.id + "]";
    clients.push(ws);
    clientSeqCounter += 1;

    console.log("New WS connection (" + ws.name +
                "). Total connections: " + clients.length);

    ws.send(JSON.stringify({type : "players", data : players}));

    ws.on('message', function(msg) { console.log(ws.name + " says: " + msg); });
    ws.on('close', function() { console.log(ws.name + " closed"); });
});

app.listen(3000);
