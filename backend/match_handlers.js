const errorCode = require("./error_code.js");
const AccessLevel = require("./access_level.js");
const match = {};

match.create_validate = function({ pgp, log }, data) {
  function validatePlayerObj(hint, player, errorArray) {
      if (!player || !player.id || !(player.score >= 0)) {
          errorArray.push({ hint: hint, error: errorCode.invalidValue });
    }
  }

  let errorArray = [];
  validatePlayerObj("player1", data.player1, errorArray);
    validatePlayerObj("player2", data.player2, errorArray);
  if (errorArray.length > 0) {
    return Promise.reject(errorArray);
  }
  return Promise.resolve();
};

match.create = function({ pgp, log }, { data, replyOK, replyFail }) {
  pgp.query(
    "INSERT into match_results " +
      "(player1_id, player1_score, player2_id, player2_score) " +
      "VALUES ($1, $2, $3, $4) RETURNING id;",
    [data.player1.id, data.player1.score, data.player2.id, data.player2.score],
    (err, result) => {
      if (err) {
        log("unhandled db error: " + JSON.stringify(err));
        replyFail([{ error: errorCode.internal }]);
      } else {
        replyOK({ matchId: result.rows[0].id });
      }
    }
  );
};

match.get_validate = function({ pgp, log }, data) {
  log("TODO: IMPLEMENT");
  return Promise.resolve();
};

match.get = function({ pgp, log }, { data, replyOK, replyFail }) {
  log("TODO: IMPLEMENT");
};

const handlers = [
  {
    name: "match:create",
    minAccessLevel: AccessLevel.any,
    validate: match.create_validate,
    handler: match.create
  },
  {
    // Without extra parametes all matches for the current user is returned.
    // Provide userId to get maches for another user.
    // Provide matchId to get specific match.
    name: "match:get",
    minAccessLevel: AccessLevel.user,
    validate: match.get.validate,
    handler: match.get
  }
];

module.exports = handlers;
