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

let connectionCounter = 0;

class User {
  constructor() {
    this.accessLevel = AccessLevel.any;
    this.info = undefined;
    this.auth = undefined;
    this.connectionId = connectionCounter++;
    this.updateLogPrefix();
  }

  log(...args) {
    return log(this.logPrefix + args);
  }

  updateLogPrefix() {
    this.logPrefix =
      "[" +
      (this.info ? this.info.email : "unauthed " + this.connectionId) +
      " (" +
      this.accessLevel.shortName +
      ")]: ";
  }

  // Mark user as logged in
  login(info, auth, accessLevel) {
    this.log(
      "signed in (as " +
        info.email +
        ", with access level '" +
        accessLevel.name +
        "')"
    );
    this.info = info;
    this.accessLevel = accessLevel;
    this.auth = auth;
    this.updateLogPrefix();
  }

  // Logout user
  logout() {
    this.accessLevel = AccessLevel.any;
    this.info = undefined;
    this.auth = undefined;

    this.log("logged out");
    this.updateLogPrefix();
  }

  executeCommand(cmd, pgp, data, socketReply) {
    const cmdLog = (...args) => {
      return this.log("[" + cmd.name + "]: " + args);
    };

    if (this.accessLevel.level < cmd.minAccessLevel.level) {
      // Not allowed to execute this command
      cmdLog("Not allowed to execute");
      socketReply({ status: 1, errors: [{ error: errorCode.notAllowed }] });
      return;
    }
    const cmdContext = {
      info: this.info,
      pgp: pgp,
      log: cmdLog,
      auth: this.auth,
      accessLevel: this.accessLevel,
      login: (info, auth, accessLevel) => this.login(info, auth, accessLevel),
      logout: () => this.logout()
    };
    cmd
      .validate(cmdContext, data)
      .then(() => {
        // Parameters was valid - Execute the handler
        cmdLog("Parameters was valid");
        cmd.handler(cmdContext, {
          data,
          replyOK: reply => {
            cmdLog("Was executed succesfully");
            socketReply({ status: 0, result: reply });
          },
          replyFail: errorArray => {
            cmdLog("Error executing: " + JSON.stringify(errorArray));
            socketReply({ status: 1, errors: errorArray });
          }
        });
      })
      .catch(errorArray => {
        cmdLog("Error executing: " + JSON.stringify(errorArray));
        socketReply({ status: 1, errors: errorArray });
      });
  }
}

io.on("connection", socket => {
  let user = new User();
  user.log("Connected from " + socket.request.connection.remoteAddress);

  socket.on("disconnect", () => {
    user.log("Disconnected");
  });

  // Register command handlers
  for (let i = 0; i < commandHandlers.length; i++) {
    let cmd = commandHandlers[i];
    socket.on(cmd.name, (data, reply) => {
      user.executeCommand(cmd, pgp, data, reply);
    });
  }
});

log("Listening for connections at port " + config.express.port);
server.listen(config.express.port);
