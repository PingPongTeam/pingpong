const errorCode = require("./error_code.js");
const AccessLevel = require("./access_level.js");
const match = {};

match.create_validate = function(user, data) {
  function validatePlayerObj(hint, player, errorArray) {
    if (!player || !player.id || !(player.score >= 0)) {
      errorArray.push({ hint: hint, error: errorCode.invalidValue });
    }
  }

  let errorArray = [];
  validatePlayerObj("player1", data.player1, errorArray);
  validatePlayerObj("player2", data.player2, errorArray);
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
  if (errorArray.length > 0) {
    return Promise.reject(errorArray);
  }
  return Promise.resolve();
};

match.create = function(user, { data, replyOK, replyFail }) {
  const pgp = user.pgp;
  pgp.query(
    "INSERT into match_results " +
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
  return Promise.resolve();
};

match.get = function(user, { data, replyOK, replyFail }) {
  const pgp = user.pgp;
  function matchFromDbMatch(row) {
    return {
      matchId: row.id,
      player1: {
        id: row.player1_id,
        score: row.player1_score,
        name: row.player1_name,
        alias: row.player1_alias
      },
      player2: {
        id: row.player2_id,
        score: row.player2_score,
        name: row.player2_name,
        alias: row.player2_alias
      },
      date: row.end_date
    };
  }

  if (data.matchId) {
    pgp
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
          match_results AS m
         INNER JOIN users AS u1
          ON m.player1_id = u1.id
         INNER JOIN users AS u2
          ON m.player2_id = u2.id
         WHERE m.id = $1;`,
        [data.matchId]
      )
      .then(res => {
        const match = matchFromDbMatch(res.rows[0]);
        replyOK({ matches: [match] });
      })
      .catch(err => {
        user.log("db error (" + JSON.stringify(data) + "): " + err);
        replyFail([{ error: errorCode.internal }]);
      });
  } else {
    const userId1 = data.userId || data.userId1 || user.info.userId;
    const userId2 = data.userId2 || userId1;
    const betweenUsers = userId1 !== userId2 ? true : false;
    user.log("Get matches of user " + userId1 + " and " + userId2);
    const andOrThing = betweenUsers ? "AND" : "OR";
    pgp
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
          match_results AS m
         INNER JOIN users AS u1
          ON m.player1_id = u1.id
         INNER JOIN users AS u2
          ON m.player2_id = u2.id
         WHERE m.player1_id = $1 ${andOrThing} m.player2_id = $2;`,
        [userId1, userId2]
      )
      .then(res => {
        let matches = [];
        res.rows.forEach(row => {
          const match = matchFromDbMatch(row);
          matches.push(match);
        });
        replyOK({ matches: matches });
      })
      .catch(err => {
        user.log("db error (" + JSON.stringify(data) + "): " + err);
        replyFail([{ error: errorCode.internal }]);
      });
  }
};

const handlers = [
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
];

module.exports = handlers;
