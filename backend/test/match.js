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

function createLoginUser(socket, user) {
  return new Promise((fulfill, reject) => {
    createUser(socket, user).then(() => {
      socket.emit("user:login", { token: user.token }, result => {
        fulfill(user);
      });
    });
  });
}

describe("match:create/match:get", () => {
  let socket;
  const users = [];
  for (let i = 0; i < 10; i++) {
    const rand = Math.floor(Date.now() / 1000).toString() + i;
    const user = {
      alias: "myalias" + rand,
      email: "email_" + rand + "@host.com",
      name: "Randomuser " + rand,
      password: "StupidPassword"
    };
    users.push(user);
  }

  before("Connect to backend", () => {
    socket = io.connect(socketUrl, socketOpts);
    return new Promise((fulfill, reject) => {
      socket.on("connect", () => {
        let waitFor = [];
        users.forEach(user => {
          waitFor.push(createUser(socket, user));
        });
        Promise.all(waitFor).then(fulfill);
      });
    });
  });

  after(() => {
    socket.close();
  });

  it("login", done => {
    socket.emit(
      "user:login",
      {
        token: users[0].token
      },
      result => {
        assert(result.status === 0, "Unexpected status");
        done();
      }
    );
  });
  let matches = [];
  it("create 1st", done => {
    socket.emit(
      "match:create",
      {
        player1: { id: users[0].id, score: 0 },
        player2: { id: users[1].id, score: 3 }
      },
      result => {
        matches.push(result.result.matchId);
        assert(result.status === 0, "Unexpected status");
        assert(result.result.matchId, "Unexpected status");
        done();
      }
    );
  });
  it("create 2nd", done => {
    socket.emit(
      "match:create",
      {
        player1: { id: users[0].id, score: 2 },
        player2: { id: users[3].id, score: 1 }
      },
      result => {
        matches.push(result.result.matchId);
        assert(result.status === 0, "Unexpected status");
        assert(result.result.matchId, "Unexpected status");
        done();
      }
    );
  });
  it("create 3th", done => {
    socket.emit(
      "match:create",
      {
        player1: { id: users[4].id, score: 2 },
        player2: { id: users[0].id, score: 1 }
      },
      result => {
        matches.push(result.result.matchId);
        assert(result.status === 0, "Unexpected status");
        assert(result.result.matchId, "Unexpected status");
        done();
      }
    );
  });
  it("Try to create match between 2 other players", done => {
    socket.emit(
      "match:create",
      {
        player1: { id: users[2].id, score: 0 },
        player2: { id: users[1].id, score: 3 }
      },
      result => {
        assert(result.status === 1, "Unexpected status");
        done();
      }
    );
  });

  it("Get single match", done => {
    socket.emit(
      "match:get",
      {
        matchId: matches[0]
      },
      result => {
        assert(result.status === 0, "Unexpected status");
        assert(
          result.result.matches.length === 1,
          "Unexpected number of matches"
        );
        assert(
          result.result.matches[0].matchId !== matches[0].id,
          "Unexpected matchId"
        );
        done();
      }
    );
  });
  it("Get all user matches", done => {
    socket.emit("match:get", {}, result => {
      assert(result.status === 0, "Unexpected status");
      assert(
        result.result.matches.length === 3,
        "Unexpected number of matches"
      );
      done();
    });
  });
  it("Get another user's matches", done => {
    socket.emit("match:get", { userId: users[1].id }, result => {
      assert(result.status === 0, "Unexpected status");
      assert(
        result.result.matches.length === 1,
        "Unexpected number of matches"
      );
      done();
    });
  });
  it("Get all (1) matches between self and someone else", done => {
    socket.emit("match:get", { userId2: users[1].id }, result => {
      assert(result.status === 0, "Unexpected status");
      assert(
        result.result.matches.length === 1,
        "Unexpected number of matches"
      );
      assert(
        result.result.matches[0].matchId === matches[0],
        "Unexpected matchId"
      );
      done();
    });
  });
  it("Get 0 matches between others", done => {
    socket.emit(
      "match:get",
      { userId1: users[1].id, userId2: users[2].id },
      result => {
        assert(result.status === 0, "Unexpected status");
        assert(
          result.result.matches.length === 0,
          "Unexpected number of matches"
        );
        done();
      }
    );
  });
});
