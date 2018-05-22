const validation = require("./validation.js");
const errorCode = require("./error_code.js");
const AccessLevel = require("./access_level.js");
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
  const pgp = user.pgp;
  pgp.query(
    "INSERT into match_result " +
      "(player1_id, player1_score, player2_id, player2_score) " +
      "VALUES ($1, $2, $3, $4) RETURNING id;",
    [data.player1.id, data.player1.score, data.player2.id, data.player2.score],
    (err, result) => {
      if (err) {
        user.log("unhandled db error: " + JSON.stringify(err));
        replyFail([{ error: errorCode.internal }]);
      } else {
        replyOK({ matchId: result.rows[0].id });
      }
    }
  );
};

match.get_validate = function(user, data) {
  return validation.validate(data, "/MatchGet");
};

function getMatches(pgp, { userId1, userId2, matchId }) {
  let variables = [];
  let whereStatement = "";
  if (matchId) {
    variables.push(matchId);
    whereStatement = "WHERE m.id = $1;";
  } else if (userId1 && userId2) {
    const betweenUsers = userId1 !== userId2 ? true : false;
    whereStatement = `WHERE (m.player1_id = $1 AND m.player2_id = $2)
                      OR (m.player1_id = $2 AND m.player2_id = $1);`;
    variables.push(userId1);
    variables.push(userId2);
  } else if (userId1) {
    whereStatement = "WHERE (m.player1_id = $1 OR m.player2_id = $1)";
    variables.push(userId1);
  }

  function matchFromDbMatch(row) {
    return {
      matchId: row.id,
      player: [{
        id: row.player1_id,
        score: row.player1_score,
        name: row.player1_name,
        alias: row.player1_alias
      },
      {
        id: row.player2_id,
        score: row.player2_score,
        name: row.player2_name,
        alias: row.player2_alias
      }],
      date: row.end_date
    };
  }

  return pgp
    .query(
      `SELECT
          m.id,
          m.player1_id,
          m.player1_score,
          m.player2_id,
          m.player2_score,
          m.end_date,
          u1.name AS player1_name,
          u1.alias AS player1_alias,
          u2.name AS player2_name,
          u2.alias AS player2_alias
         FROM
          match_result AS m
         INNER JOIN users AS u1
          ON m.player1_id = u1.id
         INNER JOIN users AS u2
          ON m.player2_id = u2.id
         ${whereStatement};`,
      variables
    )
    .then(res => {
      let matchArray = res.rows.map(row => matchFromDbMatch(row));
      return Promise.resolve(matchArray);
    });
}

match.get = function(user, { data, replyOK, replyFail }) {
  const pgp = user.pgp;

  if (data.matchId) {
    getMatches(pgp, { matchId: data.matchId })
      .then(matches => {
        replyOK({ matches: matches });
      })
      .catch(err => {
        user.log("db error (" + JSON.stringify(data) + "): " + err);
        replyFail([{ error: errorCode.internal }]);
      });
  } else {
    const userId1 = data.userId || data.userId1 || user.info.userId;
    getMatches(pgp, { userId1: userId1, userId2: data.userId2 })
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
  let pgp = eventContext.pgp;
  let log = eventContext.log;
  let userFromUserId = eventContext.userFromUserId;

  // Query db to get which users are referenced
  getMatches(pgp, { matchId: matchId })
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
