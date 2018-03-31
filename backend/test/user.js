const io = require("socket.io-client");
const config = require("../config.js");
const chai = require("chai");
const assert = chai.assert;

const socketUrl = "http://localhost:" + config.express.port.toString();
const socketOpts = {
  forceNew: true,
  reconnection: false
};

describe("user:create", () => {
  let socket;
  before("Connect to backend", () => {
    socket = io.connect(socketUrl, socketOpts);
    return new Promise((fulfill, reject) => {
      socket.on("connect", () => {
        return fulfill();
      });
    });
  });

  after(() => {
    socket.close();
  });

  const randstr = Math.floor(Date.now() / 1000).toString();
  it("non existing user", done => {
    socket.emit(
      "user:create",
      {
        alias: "myalias" + randstr,
        email: "email_" + randstr + "@host.com",
        name: "Randomuser " + randstr,
        password: "StupidPassword"
      },
      result => {
        assert(result.status === 0, "Unexpected status");
        assert(result.result.userId >= 0, "Unexpected userId");
        assert(result.result.token, "Missing token");
        done();
      }
    );
  });
  it("existing alias", done => {
    socket.emit(
      "user:create",
      {
        alias: "myalias" + randstr,
        email: "whatever@host.com",
        name: "Noname User",
        password: "StupidPassword"
      },
      result => {
        assert(result.status === 1, "Unexpected status");
        assert(result.errors[0].hint === "alias", "Unexpected hint");
        assert(
          result.errors[0].error.errorName === "ValueInUse",
          "Unexpected error name"
        );
        done();
      }
    );
  });
  it("existing email", done => {
    socket.emit(
      "user:create",
      {
        alias: "whatever",
        email: "email_" + randstr + "@host.com",
        name: "Noname User",
        password: "StupidPassword"
      },
      result => {
        assert(result.status === 1, "Unexpected status");
        assert(result.errors[0].hint === "email", "Unexpected hint");
        assert(
          result.errors[0].error.errorName === "ValueInUse",
          "Unexpected error name"
        );
        done();
      }
    );
  });
  it("existing alias+email", done => {
    socket.emit(
      "user:create",
      {
        alias: "myalias" + randstr,
        email: "email_" + randstr + "@host.com",
        name: "Noname User",
        password: "StupidPassword"
      },
      result => {
        assert(result.status === 1, "Unexpected status");
        assert(
          result.errors[0].error.errorName === "ValueInUse",
          "Unexpected error name"
        );
        done();
      }
    );
  });
});

describe("user:login", () => {
  let socket;
  const randstr = Math.floor(Date.now() / 1000).toString();
  const createdUser = {
    alias: "unique_alias_" + randstr,
    email: "unique_email_" + randstr + "@host.com",
    name: "UniqueUser " + randstr,
    password: "StupidPassword"
  };
  let createdUserId;
  let createdUserToken;
  before("Connect to backend", () => {
    return new Promise((fulfill, reject) => {
      socket = io.connect(socketUrl, socketOpts);
      socket.on("connect", () => {
        socket.emit("user:create", createdUser, result => {
          if (result.status === 0) {
            createdUserId = result.result.userId;
            createdUserToken = result.result.token;
            return fulfill();
          } else {
            return reject();
          }
        });
      });
    });
  });

  after(() => {
    socket.close();
  });

  it("non existing user", done => {
    socket.emit(
      "user:login",
      {
        auth: "shouldMostLikelyNotExist",
        password: "StupidPassword"
      },
      result => {
        assert(result.status === 1, "Unexpected status");
        assert(result.errors[0].hint === "auth", "Unexpected hint");
        assert(
          result.errors[0].error.errorName === "InvalidUser",
          "Unexpected error name"
        );
        done();
      }
    );
  });
  it("existing user by email", done => {
    socket.emit(
      "user:login",
      {
        auth: createdUser.email,
        password: createdUser.password
      },
      result => {
        assert(result.status === 0, "Unexpected status");
        assert(result.result.userId === createdUserId, "Unexpected user id");
        assert(result.result.token, "Missing token");
        done();
      }
    );
  });
  it("existing user by alias", done => {
    socket.emit(
      "user:login",
      {
        auth: createdUser.alias,
        password: createdUser.password
      },
      result => {
        assert(result.status === 0, "Unexpected status");
        assert(result.result.userId === createdUserId, "Unexpected user id");
        assert(result.result.token, "Missing token");
        done();
      }
    );
  });
  it("existing user by token", done => {
    socket.emit(
      "user:login",
      {
        token: createdUserToken
      },
      result => {
        assert(result.status === 0, "Unexpected status");
        assert(result.result.userId === createdUserId, "Unexpected user id");
        assert(result.result.token, "Missing token");
        done();
      }
    );
  });
});

describe("user:search", () => {
  let socket;
  const randstr = Math.floor(Date.now() / 1000).toString();

  before("Connect to backend and create users", () => {
    return new Promise((fulfill, reject) => {
      let promises = [];
      socket = io.connect(socketUrl, socketOpts);
      socket.on("connect", () => {
        for (let i = 0; i < 10; i++) {
          const user = {
            alias: "searchUser_" + i,
            email: "searchUser_" + i + "@mail.com",
            name: "searchUser " + i,
            password: "StupidPassword"
          };
          promises.push(
            new Promise(fulfillCreated => {
              socket.emit("user:create", user, result => {
                return fulfillCreated();
              });
            })
          );
        }
        Promise.all(promises).then(fulfill);
      });
    });
  });

  after(() => {
    socket.close();
  });

  it("Match 10 existing users", done => {
    socket.emit(
      "user:search",
      {
        aliasOrEmail: "searchU"
      },
      result => {
        assert(result.status === 0, "Unexpected status");
        assert(result.result.length === 10, "Unexpected number of matches");
        assert(result.result[0].userId >= 0, "Unexpected userId");
        assert(result.result[0].name, "Missing name");
        assert(result.result[0].alias, "Missing alias");
        done();
      }
    );
  });
  it("Match 1 existing user", done => {
    socket.emit(
      "user:search",
      {
        aliasOrEmail: "searchUser_5"
      },
      result => {
        assert(result.status === 0, "Unexpected status");
        assert(result.result.length === 1, "Unexpected number of matches");
        assert(result.result[0].userId >= 0, "Unexpected userId");
        assert(result.result[0].name === "searchUser 5", "Unexpected name");
        assert(result.result[0].alias === "searchUser_5", "Unexpected alias");
        done();
      }
    );
  });
  it("Lookup non existing user", done => {
    socket.emit(
      "user:search",
      {
        aliasOrEmail: "AUserWhichDoesNotExist"
      },
      result => {
        assert(result.status === 0, "Unexpected status");
        assert(result.result.length === 0, "Unexpected number of matches");
        done();
      }
    );
  });
  it("Lookup with invalid characters", done => {
    socket.emit(
      "user:search",
      {
        aliasOrEmail: "InvalidCharacters:#"
      },
      result => {
        assert(result.status === 1, "Unexpected status");
        assert(result.errors[0].hint === "aliasOrEmail", "Unexpected hint");
        assert(
          result.errors[0].error.errorName === "InvalidValue",
          "Unexpected error"
        );
        done();
      }
    );
  });
});
