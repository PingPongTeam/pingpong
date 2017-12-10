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

function newToken({email}, expirationTime)
{
  const tokenData = {email : email};
  return new Promise(function(fulfill, reject) {
    expirationTime = expirationTime || config.jwt.expiration;
    log("Sign token");
    jwt.sign(tokenData, config.jwt.secret, {expiresIn : expirationTime},
             function(err, token) {
               if (err) {
                 reject(new Error("Error signing token: " + err));
               } else {
                 fulfill(token);
               }
             });
  });
}

io.on('connection', function onConnection(socket) {

  log("New connection from " + socket.request.connection.remoteAddress);

  socket.on('user:signup', function onUserSignup(data, answer) {
    log("User signup: " + JSON.stringify(data));
    r.table('users')
        .filter({'email' : data.email})
        .run()
        .then(function(result) {
          if (result.length !== 0) {
            // User with this email already exists in database
            log("Email '" + data.email + "' is already registered");
            answer({status : 1, error : "email is already registered"});
            return Promise.resolve();
            }

          // Create user
          return r.table('users')
              .insert({
                email : data.email,
                name : data.name,
                password : data.password,
                timeOfCreation : r.now()
              })
              .run()
              .then(function onCreatedUser(result) {
                if (result.errors) {
                  log("Error creating user: " + JSON.stringify(result));

                  // Return some kind of internal server error
                  return Promise.reject(new Error(result.first_error));
                } else {
                  log("New user created: " + JSON.stringify(result));
                  return newToken(data.email).then(function(token) {
                    // TODO: Should fetch/generate and return a jwt.
                    answer({status : 0, token : token});
                    return Promise.resolve();
                  });
                }
              })
              .catch(function(error) {
                // Return internal server error to client
                log("Error creating user: " + error);
                answer({status : 500, errors : [ error ]});
              });
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
