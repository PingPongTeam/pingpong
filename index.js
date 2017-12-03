const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const config = require('./config.js');
const r = require('rethinkdbdash')(config.rethink);
const common = require('./common.js');
const log = common.log;

app.use(express.static(path.join(__dirname, 'public')));

r.table('users').changes().run().then(function(cursor) {
    cursor.each(function(err, item) {
        log("User table updated: " + JSON.stringify(item));
    });
});

setInterval(function() {
    r.table('users')
        .insert({
            userId : 'stupiduser' + Date.now(),
            name : 'whatever',
            password : 'badpassword'
        })
        .run()
        .then(function(result) {
            if (result.errors) {
                log("Error creating user: " + JSON.stringify(result));
            } else {
                log("New user created: " + JSON.stringify(result));
            }
        });
}, 1000);
server.listen(config.express.port);
