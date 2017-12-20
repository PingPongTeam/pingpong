const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const config = require('./config.js');
const r = require('rethinkdbdash')(config.rethink);
const common = require('./common.js');
const log = common.log;
const UserDb = require('./user_db.js');
const userDb = new UserDb(r);

io.on('connection', function onConnection(socket) {

  log("New connection from " + socket.request.connection.remoteAddress);

  socket.on('user:create', function(data, replyUser) {
    // TODO: Should validate incomming parameter(s) here and return errors
    // accordingly.
    userDb.create(data)
        .then(function({userId, token}) {
          socket.userId = userId;
          socket.token = token;
          log("User created: " + userId);
          replyUser({status : 0, token : token});
        })
        .catch(function(errorArray) {
          log("Error creating user: " + JSON.stringify(errorArray));
          replyUser({status : 1, errors : errorArray});
        });
  });

  socket.on('user:login', function(data, replyUser) {
    // TODO: Should validate incomming parameter(s) here and return errors
    // accordingly.
    userDb.login(data)
        .then(function({userId, token}) {
          socket.userId = userId;
          socket.token = token;
          log("User logged in: " + userId);
          replyUser({status : 0, token : token});
        })
        .catch(function(errorArray) {
          log("User failed to login: " + JSON.stringify(errorArray));
          replyUser({status : 1, errors : errorArray});
        });
  });

  // TODO: Commands to allow ONLY when a user is authenticated, so plz check auth ffs!
  socket.on('user:search', function(data, replyUser) {
    // TODO: Should validate incomming parameter(s) here and return errors
    // accordingly.
    userDb.match([ 'name', 'email' ], "^" + data.filter)
        .then(function(users) {
          // Only return specific fields of each user
          users = users.map(function({email, id, name}) {
            return {email, id, name};
          });
          replyUser(users);
        })
        .catch(function(error) {
          log("Error searching for users: " + error);
          replyUser({status : 1, errors : [ errorCode.internal ]});
        });
  });
});

log("Listening for connections at port " + config.express.port);
server.listen(config.express.port);
