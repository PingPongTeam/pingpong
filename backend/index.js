const path = require("path");
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const config = require("./config.js");
const { Pool } = require("pg");
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

log("Connecting to " + config.db.uri);
const pgp = new Pool({ connectionString: config.db.uri });

function executeCommand({ socket, pgp, command }, data, reply) {
  log("Incomming '" + command.name + "' request");

  if (command.mustBeAuthed && !socket.token) {
    // TODO: Reply error
  }

  command
    .validate({ socket, pgp, command }, data)
    .then(function() {
      // Parameters was valid - Execute the handler
      log("'" + command.name + "' parameters was valid");
      return command.handler({ socket, pgp, command }, data);
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

  // Register command handlers
  for (let i = 0; i < commandHandlers.length; i++) {
    let command = commandHandlers[i];
    socket.on(command.name, (data, reply) => {
      executeCommand({ socket, pgp, command }, data, reply);
    });
  }
});

log("Listening for connections at port " + config.express.port);
server.listen(config.express.port);
