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

var PPAPI = {};

app.all('/v1/newplayer', jsonParser, async function(req, res) {
    console.log(req.path + " request (from " + req.ip + ")");
    if (!req.body)
        return res.sendStatus(400);
    const result = await PPAPI.newPlayer(req.body);
    console.log("result=" + JSON.stringify(result));
    res.json(result);
});

app.all('/v1/newleague', jsonParser, async function(req, res) {
    console.log(req.path + " request (from " + req.ip + ")");
    if (!req.body)
        return res.sendStatus(400);
    res.json(await PPAPI.newLeauge(req.body));
});

PPAPI.newPlayer = async function(obj) {
    const players = await db.getPlayers();
    console.log("Create player (" + JSON.stringify(obj) + ")");
    if (players.find(function(player) {
            return player.name === obj.name;
        })) {
        return {rc : -1, msg : "Player '" + obj.name + "' already exists"};
    } else {
        try {
            const res = await db.registerPlayer(obj.name, obj.initialScore || 0);
            tellAll("players", await db.getPlayers());
            return {rc: 0, data: res};
        } catch (err) {
            return {rc: -1, data: err};
        }
    }
}

PPAPI.newLeague = async function(obj) {
    // TODO
};



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
