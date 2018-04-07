const io = require("socket.io-client");
const config = require("../config.js");
const chai = require("chai");
const assert = chai.assert;

const socketUrl = "http://localhost:" + config.express.port.toString();
const socketOpts = {
  forceNew: true,
  reconnection: false
};

function createUser(socket, user) {
  return new Promise((fulfill, reject) => {
    socket.emit("user:create", user, result => {
      if (result.status === 0) {
        user.id = result.result.userObject.userId;
        user.token = result.result.token;
        fulfill(user);
      } else {
        reject(result.errors);
      }
    });
  });
}

describe("user:create/user:remove", () => {
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
  const user = {
    alias: "myalias" + randstr,
    email: "email_" + randstr + "@host.com",
    name: "Randomuser " + randstr,
    password: "StupidPassword"
  };
  it("non existing user", done => {
    socket.emit("user:create", user, result => {
      user.token = result.result.token;
      user.id = result.result.userId;
      assert(result.status === 0, "Unexpected status");
      assert(result.result.userObject.userId >= 0, "Unexpected userId");
      assert(result.result.token, "Missing token");
      done();
    });
  });
  it("existing alias", done => {
    socket.emit(
      "user:create",
      {
        alias: user.alias,
        email: "whatever@host.com",
        name: "Noname User",
        password: "StupidPassword"
      },
      result => {
        assert(result.status === 1, "Unexpected status");
        assert(result.errors.length === 1, "Should be 1 collision");
        assert(result.errors[0].hint === "alias", "Unexpected hint");
        assert(
          result.errors[0].error === "ValueInUse",
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
        email: user.email,
        name: "Noname User",
        password: "StupidPassword"
      },
      result => {
        assert(result.status === 1, "Unexpected status");
        assert(result.errors.length === 1, "Should be 1 collision");
        assert(result.errors[0].hint === "email", "Unexpected hint");
        assert(
          result.errors[0].error === "ValueInUse",
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
        alias: user.alias,
        email: user.email,
        name: "Noname User",
        password: "StupidPassword"
      },
      result => {
        assert(result.status === 1, "Unexpected status");
        assert(result.errors.length === 2, "Should be 2 collisions");
        assert(
          result.errors[0].error === "ValueInUse",
          "Unexpected error name"
        );
        done();
      }
    );
  });
  it("login", done => {
    socket.emit(
      "user:login",
      {
        token: user.token
      },
      result => {
        assert(result.status === 0, "Unexpected status");
        done();
      }
    );
  });

  it("remove self", done => {
    socket.emit(
      "user:remove",
      {
        password: "StupidPassword"
      },
      result => {
        assert(result.status === 0, "Unexpected status");
        done();
      }
    );
  });
  it("remove again", done => {
    socket.emit(
      "user:remove",
      {
        password: "StupidPassword"
      },
      result => {
        assert(result.status === 1, "Unexpected status");
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
  before("Connect to backend", () => {
    return new Promise((fulfill, reject) => {
      socket = io.connect(socketUrl, socketOpts);
      socket.on("connect", () => {
        return createUser(socket, createdUser).then(fulfill);
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
          result.errors[0].error === "InvalidUser",
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
        assert(
          result.result.userObject.userId === createdUser.id,
          "Unexpected user id"
        );
        assert(
          result.result.userObject.name === createdUser.name,
          "Unexpected user name"
        );
        assert(
          result.result.userObject.email === createdUser.email,
          "Unexpected email name"
        );
        assert(
          result.result.userObject.alias === createdUser.alias,
          "Unexpected name name"
        );
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
        assert(
          result.result.userObject.userId === createdUser.id,
          "Unexpected user id"
        );
        assert(
          result.result.userObject.name === createdUser.name,
          "Unexpected user name"
        );
        assert(
          result.result.userObject.email === createdUser.email,
          "Unexpected email name"
        );
        assert(
          result.result.userObject.alias === createdUser.alias,
          "Unexpected name name"
        );
        assert(result.result.token, "Missing token");
        done();
      }
    );
  });
  it("existing user by token", done => {
    socket.emit(
      "user:login",
      {
        token: createdUser.token
      },
      result => {
        assert(result.status === 0, "Unexpected status");
        assert(
          result.result.userObject.userId === createdUser.id,
          "Unexpected user id"
        );
        assert(
          result.result.userObject.name === createdUser.name,
          "Unexpected user name"
        );
        assert(
          result.result.userObject.email === createdUser.email,
          "Unexpected email name"
        );
        assert(
          result.result.userObject.alias === createdUser.alias,
          "Unexpected name name"
        );
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

  it("Login user", done => {
    socket.emit(
      "user:login",
      {
        auth: "searchUser_1",
        password: "StupidPassword"
      },
      result => {
        done();
      }
    );
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
        assert(result.result[0].email, "Missing name");
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
        assert(
          result.result[0].email === "searchUser_5@mail.com",
          "Unexpected alias"
        );
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
        assert(result.errors[0].error === "InvalidValue", "Unexpected error");
        done();
      }
    );
  });

  it("Logout user", done => {
    socket.emit("user:logout", {}, result => {
      assert(result.status === 0, "Unexpected status");
      done();
    });
  });

  it("Search while not logged in", done => {
    socket.emit(
      "user:search",
      {
        aliasOrEmail: "searchUser"
      },
      result => {
        assert(result.status === 1, "Unexpected status");
        assert(result.errors[0].error === "NotAllowed", "Unexpected error");
        done();
      }
    );
  });
});
