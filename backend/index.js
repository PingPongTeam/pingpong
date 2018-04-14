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
const commandHandlers = [].concat(
  userHandlers.commands,
  matchHandlers.commands
);
const eventHandlers = Object.assign(matchHandlers.events);

log("Connecting to " + config.db.uri);
const pgp = new Pool({ connectionString: config.db.uri });

// Setup a postgres notification listener
pgp.connect((err, client, release) => {
  if (err) {
    console.log(err);
    log("Failed to connect to db: " + err);
  } else {
    client.on("notification", function(msg) {
      // Called on new post in any watched table
      let [table, col, id] = msg.payload.split(",");
      if (eventHandlers[table]) {
        // We have an event handler which matches with the table name
        let evh = eventHandlers[table];
        const eventContext = {
          id: id,
          pgp: pgp,
          log: (...args) => {
            log("[" + evh.name + "]: " + args);
          },
          userFromUserId: userFromUserId
        };
        evh.handler(eventContext);
      }
    });
    client.query("LISTEN watchers").then(res => {
      log("Now connected to db and listening for notifications");
    });
  }
});

const userFromUserId = {};

let connectionCounter = 0;

class User {
  constructor(socket) {
    this.socket = socket;
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
      (this.info
        ? this.info.email + " (id: " + this.info.userId + ", "
        : "unauthed (") +
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

    // Add user to lookup table so that we can go from
    // user id -> a User object.
    userFromUserId[this.info.userId] = this;
  }

  emit(channel, msg, callback) {
    if (this.socket) {
      return this.socket.emit(channel, msg, callback);
    } else {
      this.log("No socket defined!?");
    }
  }

  // Logout user
  logout() {
    if (this.info && userFromUserId[this.info.userId]) {
      userFromUserId[this.info.userId] = undefined;
    }
    this.accessLevel = AccessLevel.any;
    this.info = undefined;
    this.auth = undefined;

    this.log("signed out");
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
  let user = new User(socket);
  user.log("Connected from " + socket.request.connection.remoteAddress);

  socket.on("disconnect", () => {
    user.logout();
    user.log("Disconnected");
    user.socket = undefined;
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
