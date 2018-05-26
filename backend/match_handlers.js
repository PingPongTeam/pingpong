const validation = require("./validation.js");
const errorCode = require("./error_code.js");
const AccessLevel = require("./access_level.js");
const Op = require("sequelize").Op;

const match = {};

match.create_validate = function(user, data) {
  let errorArray = validation.validate(data, "/MatchCreate");
  if (errorArray.length === 0) {
    if (
      user.accessLevel == AccessLevel.user &&
      user.info.userId !== data.player1.id &&
      user.info.userId !== data.player2.id
    ) {
      user.log("A user can't create a match between two other players.");
      errorArray.push({ error: errorCode.invalidUser });
    }
  }
  return errorArray;
};

match.create = function(user, { data, replyOK, replyFail }) {
  const db = user.db;
  db.Match.create({
    player1Score: data.player1.score,
    player2Score: data.player2.score,
    player1Id: data.player1.id,
    player2Id: data.player2.id
  }).then(result => {
    replyOK({ matchId: result.id });
  });
};

match.get_validate = function(user, data) {
  return validation.validate(data, "/MatchGet");
};

function getMatches(db, { userId1, userId2, matchId }) {
  function matchFromDbMatch(row) {
    return {
      matchId: row.id,
      player: [
        {
          score: row.player1Score,
          id: row.player1.id,
          name: row.player1.name,
          alias: row.player1.alias,
          email: row.player1.email
        },
        {
          score: row.player2Score,
          id: row.player2.id,
          name: row.player2.name,
          alias: row.player2.alias,
          email: row.player2.email
        }
      ],
      date: row.createdAt
    };
  }

  if (matchId) {
    return db.Match.findById(matchId, {
      include: [
        { model: db.User, as: "player1" },
        { model: db.User, as: "player2" }
      ]
    }).then(result => {
      if (result) {
        return Promise.resolve([matchFromDbMatch(result)]);
      }
    });
  } else if (userId1 && userId2 && userId1 != userId2) {
    return db.Match.findAll({
      where: {
        [Op.or]: [
          {
            [Op.and]: [{ player1Id: userId1 }, { player2Id: userId2 }]
          },
          {
            [Op.and]: [{ player1Id: userId2 }, { player2Id: userId1 }]
          }
        ]
      },
      include: [
        { model: db.User, as: "player1" },
        { model: db.User, as: "player2" }
      ]
    }).then(result => {
      let matchArray = result.map(row => matchFromDbMatch(row.dataValues));
      return Promise.resolve(matchArray);
    });
  } else if (userId1) {
    return db.Match.findAll({
      where: {
        [Op.or]: [{ player1Id: userId1 }, { player2Id: userId1 }]
      },
      include: [
        { model: db.User, as: "player1" },
        { model: db.User, as: "player2" }
      ]
    }).then(result => {
      let matchArray = result.map(row => matchFromDbMatch(row.dataValues));
      return Promise.resolve(matchArray);
    });
  }
}

match.get = function(user, { data, replyOK, replyFail }) {
  if (data.matchId) {
    getMatches(user.db, { matchId: data.matchId })
      .then(matches => {
        replyOK({ matches: matches });
      })
      .catch(err => {
        user.log("db error (" + JSON.stringify(data) + "): " + err);
        replyFail([{ error: errorCode.internal }]);
      });
  } else {
    const userId1 = data.userId || data.userId1 || user.info.userId;
    getMatches(user.db, { userId1: userId1, userId2: data.userId2 })
      .then(matches => {
        replyOK({ matches: matches });
      })
      .catch(err => {
        user.log("db error (" + JSON.stringify(data) + "): " + err);
        replyFail([{ error: errorCode.internal }]);
      });
  }
};

match.created = eventContext => {
  let matchId = eventContext.id;
  let log = eventContext.log;
  let userFromUserId = eventContext.userFromUserId;

  // Query db to get which users are referenced
  getMatches(eventContext.db, { matchId: matchId })
    .then(matches => {
      if (matches.length >= 1) {
        const pid1 = matches[0].player[0].id;
        const pid2 = matches[0].player[1].id;
        log(
          "New match (id: " +
            matchId +
            ", between " +
            pid1 +
            " and " +
            pid2 +
            ")"
        );
        [userFromUserId[pid1], userFromUserId[pid2]].forEach(user => {
          if (user) {
            user.log("Notify about new match");
            user.emit("match:created", matches[0]);
          }
        });
      }
    })
    .catch(err => {
      log("db error: " + JSON.stringify(err));
    });
};

const handlers = {
  events: { match_result: { name: "match:created", handler: match.created } },

  commands: [
    {
      // A user can create match between self and other player.
      // Admin can create match between anyone.
      name: "match:create",
      minAccessLevel: AccessLevel.user,
      validate: match.create_validate,
      handler: match.create
    },
    {
      // Without extra parametes all matches for the current user is returned.
      // Provide userId to get maches for another user.
      // Provide matchId to get specific match.
      name: "match:get",
      minAccessLevel: AccessLevel.user,
      validate: match.get_validate,
      handler: match.get
    }
  ]
};

module.exports = handlers;
