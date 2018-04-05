const path = require("path");
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const config = require("./config.js");
const { Pool } = require("pg");
const common = require("./common.js");
const AccessLevel = require("./access_level.js");
const dbHelpers = require("./db_helpers.js");
const errorCode = require("./error_code.js");
const userHandlers = require("./user_handlers.js");
const matchHandlers = require("./match_handlers.js");

/* Example command handler:
  {
    name: "user:create",
    mustBeAuthed: false,
    validate: createUserValidate,
    handler: createUser
  }
*/

const log = common.log;
const commandHandlers = [].concat(userHandlers, matchHandlers);

log("Connecting to " + config.db.uri);
const pgp = new Pool({ connectionString: config.db.uri });

function replyErrorLog(
  commandName,
  requestData,
  userContext,
  socketReply,
  errorArray
) {
  let shortError = errorArray
    .map(r => "" + r.hint + " (" + r.error + ")")
    .join(", ");
  userContext.log(
    "Error executing '" +
      commandName +
      "' (" +
      JSON.stringify(requestData) +
      "): " +
      shortError
  );
  socketReply({ status: 1, errors: errorArray });
}

function executeCommand(userContext, command, data, socketReply) {
  userContext.log("Incomming '" + command.name + "' request");

  if (userContext.accessLevel.level < command.minAccessLevel.level) {
    // Not allowed to execute this command
    userContext.log("Not allowed to execute '" + command.name + "'");
    socketReply({ status: 1, errors: [{ error: errorCode.notAllowed }] });
    return;
  }

  command
    .validate(userContext, data)
    .then(function() {
      // Parameters was valid - Execute the handler
      userContext.log("'" + command.name + "' parameters was valid");
      command.handler(userContext, {
        data,
        replyOK: reply => {
          userContext.log("'" + command.name + "' was executed succesfully");
          socketReply({ status: 0, result: reply });
        },
        replyFail: errorArray => {
          replyErrorLog(
            command.name,
            data,
            userContext,
            socketReply,
            errorArray
          );
        }
      });
    })
    .catch(errorArray => {
      replyErrorLog(command.name, data, userContext, socketReply, errorArray);
    });
}

let connectionCounter = 0;

io.on("connection", function onConnection(socket) {
  connectionCounter++;
  let userContext = {
    accessLevel: AccessLevel.any,
    socket: socket,
    authed: false,
    pgp: pgp
  };
  userContext.log = function(...args) {
    const prefix =
      "[" +
      (userContext.email
        ? userContext.email
        : "unauthed " + connectionCounter) +
      " (" +
      userContext.accessLevel.shortName +
      ")]:";
    return log(prefix + " " + args);
  };
  userContext.log("Connected from " + socket.request.connection.remoteAddress);

  socket.on("disconnect", () => {
    userContext.log("Disconnected");
  });

  // Register command handlers
  for (let i = 0; i < commandHandlers.length; i++) {
    let command = commandHandlers[i];
    socket.on(command.name, (data, reply) => {
      executeCommand(userContext, command, data, reply);
    });
  }
});

log("Listening for connections at port " + config.express.port);
server.listen(config.express.port);
