const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const config = require('./config.js');
const r = require('rethinkdbdash')(config.rethink);
const jwt = require('jsonwebtoken');
const common = require('./common.js');
const log = common.log;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));


io.on('connection', function onConnection(socket) {

  log("New connection from " + socket.request.connection.remoteAddress);

  socket.on('user:signup', function onUserSignup(data, answer) {
    log("User signup: " + JSON.stringify(data));
    r.table('users')
        .insert(
            {userId : data.email, name : data.name, password : data.password})
        .run()
        .then(function onCreatedUser(result) {
          if (result.errors) {
            log("Error creating user: " + JSON.stringify(result));
            // Leaking error message contains all user information.
            // Rethinkdb seems to return very machine-undfriendly error
            // messages.
            // TODO: Should return informative error messsage.
            answer({status : 1, errors : [ {msg : result.first_error} ]});
          } else {
            log("New user created: " + JSON.stringify(result));
            // TODO: Should fetch/generate and return a jwt.
            answer({status : 0, jwt : "Made up JWT"});
          }
        });
  });

  socket.on('user:signin', function(data, answer) {
    log("User signin: " + JSON.stringify(data));
    // TODO: Should fetch/generate and return a jwt.
    answer({status : 0, jwt : "Made up JWT"});
  });
});

log("Listening for connections at port " + config.express.port);
server.listen(config.express.port);
