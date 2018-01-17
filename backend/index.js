const path = require("path");
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const config = require("./config.js");
const rdb = require("rethinkdbdash")(config.rethink);
const common = require("./common.js");

const dbHelpers = require("./db_helpers.js");
const errorCode = require("./error_code.js");
const userHandlers = require("./user_handlers.js");

/* Example command handler:
  {
    name: "user:create",
    mustBeAuthed: false,
    validate: createUserValidate,
    handler: createUser
  }
*/

const log = common.log;
const commandHandlers = [].concat(userHandlers);

function executeCommand({ socket, rdb, command }, data, reply) {
  log("Incomming '" + command.name + "' request");

  if (command.mustBeAuthed && !socket.token) {
    // TODO: Reply error
  }

  command
    .validate({ socket, rdb, command }, data)
    .then(function() {
      // Parameters was valid - Execute the handler
      log("'" + command.name + "' parameters was valid");
      return command.handler({ socket, rdb, command }, data);
    })
    .then(function(result) {
      log("'" + command.name + "' was executed succesfully");
      return reply({ status: 0, result: result });
    })
    .catch(function(errorArray) {
      let shortError = errorArray
        .map(r => "" + r.hint + " (" + r.error.errorName + ")")
        .join(", ");
      log(
        "Error executing '" +
          command.name +
          "' (" +
          JSON.stringify(data) +
          "): " +
          shortError
      );
      return reply({ status: 1, errors: errorArray });
    });
}

io.on("connection", function onConnection(socket) {
  log("New connection from " + socket.request.connection.remoteAddress);

  for (command of commandHandlers) {
    socket.on(command.name, (data, reply) =>
      executeCommand({ socket, rdb, command }, data, reply)
    );
  }

  //  socket.on('user:create', (data, replyUser) => user.createUser(data,
  //  replyUser));

  // userHandlers.createUser);
  socket.on("user:login", function(data, replyUser) {
    // TODO: Should validate incomming parameter(s) here and return errors
    // accordingly.
    /*      userDb.login({alias : data.alias, email : data.email,
       data.password})
              .then(function({userId, token}) {
                socket.userId = userId;
                socket.token = token;
                log("User logged in: " + userId);
                replyUser({status : 0, token : token});
              })
              .catch(function(errorArray) {
                log("User failed to login: " + JSON.stringify(errorArray));
                replyUser({status : 1, errors : errorArray});
              });*/
  });

  // TODO: Commands to allow ONLY when a user is authenticated, so plz check
  // auth ffs!
  socket.on("user:search", function(data, replyUser) {
    /*    if (notAuthedReplyError(socket, replyUser)) {
          return;
        }

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
            });*/
  });
});

log("Listening for connections at port " + config.express.port);
server.listen(config.express.port);
