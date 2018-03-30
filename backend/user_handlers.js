const config = require("./config.js");
const common = require("./common.js");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const hash = crypto.createHash("sha256");
const dbHelpers = require("./db_helpers.js");
const errorCode = require("./error_code.js");

const log = common.log;

function newToken(userId, email, expirationTime) {
  return new Promise(function(fulfill, reject) {
    expirationTime = expirationTime || config.jwt.expiration;
    jwt.sign(
      { userId: userId, email: email },
      config.jwt.secret,
      { expiresIn: expirationTime },
      function(err, token) {
        if (err) {
          reject(new Error("Error signing token: " + err));
        } else {
          fulfill(token);
        }
      }
    );
  });
}

function randomString(length) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

function sha512(password, salt) {
  var hash = crypto.createHmac("sha512", salt);
  hash.update(password);
  var value = hash.digest("hex");
  return { salt: salt, passwordHash: value };
}

// Validate create:user parameters
function createUserValidate({ pgp }, data) {
  return new Promise(function(fulfill, reject) {
    let errorArray = [];

    if (!data.alias || data.alias.length < 2) {
      // TODO: Ensure that alias is restricted to specified characters
      errorArray.push({ hint: "alias", error: errorCode.invalidValue });
    }
    if (!data.email || data.email.length < 2) {
      // TODO: Ensure that email is an actual email address
      errorArray.push({ hint: "email", error: errorCode.invalidValue });
    }
    if (!data.name || data.name.length < 2) {
      errorArray.push({ hint: "name", error: errorCode.invalidValue });
    }
    if (!data.password || data.password.length < 5) {
      errorArray.push({ hint: "password", error: errorCode.invalidValue });
    }
    if (errorArray.length > 0) {
      return reject(errorArray);
    }
    return fulfill();
  });
}

// Create user
function createUser({ pgp }, data) {
  // Create a hashed password and insert user in db
  return new Promise(function(fulfill, reject) {
    const passwd = sha512(data.password, randomString(16));
    return pgp.query(
      "INSERT into users(email, alias, name, passwdHash, passwdSalt) VALUES " +
        "($1, $2, $3, $4, $5) RETURNING id;",
      [data.email, data.alias, data.name, passwd.passwordHash, passwd.salt],
      (err, result) => {
        if (err) {
          // TODO: Can we detect if both email and/or alias is in use
          // in one query? Now the first one detected is reflected in the error.
          if (err.code === "23505") {
            // Some value is not unique
            let valueName =
              err.constraint === "users_alias_key" ? "alias" : "email";
            return reject([{ hint: valueName, error: errorCode.inUse }]);
          } else {
            log("unhandled db error: " + JSON.stringify(err));
            return reject([{ error: errorCode.internal }]);
          }
        } else {
          // User was created - Generate token and return
          let userId = result.rows[0].id;
          return newToken(userId, data.email).then(function(token) {
            log("Created user " + data.alias + " (" + userId + ")");
            return fulfill({ userId, token });
          });
        }
      }
    );
  });
}

// Validate login:user parameters
function loginUserValidate({ pgp }, data) {
  let errorArray = [];
  if (!data.token) {
    errorArray.push({ hint: "token", error: errorCode.missingValue });
  } else {
    return Promise.resolve();
  }
  if (!data.password || !data.auth) {
    if (!data.password) {
      errorArray.push({ hint: "password", error: errorCode.missingValue });
    }
    if (!data.auth) {
      errorArray.push({ hint: "auth", error: errorCode.missingValue });
    }
  } else {
    return Promise.resolve();
  }
  return Promise.reject(errorArray);
}

function loginUser({ pgp }, data) {
  return new Promise(async function(fulfill, reject) {
    if (data.token) {
      // Received token for authentication
      log("Got token");
      jwt.verify(data.token, config.jwt.secret, function(err, decoded) {
        if (err) {
          log("Invalid token: " + JSON.stringify(err));
          return reject([{ hint: "token", error: errorCode.invalidToken }]);
        } else {
          // Issue a (new) token to user

          return newToken(decoded.userId, decoded.email)
            .then(function(token) {
              log("User '" + decoded.email + "' signed in. Return token.");
              return fulfill({ userId: decoded.userId, token: token });
            })
            .catch(function(error) {
              log("Error creating token: " + error);
            });
        }
      });
    } else {
      // Received alias/email and password for authentication
      log("Got auth (auth='" + data.auth + "')");

      pgp
        .query(
          "SELECT id, email, passwdhash, passwdsalt" +
            " FROM users WHERE email = $1 OR alias = $1",
          [data.auth]
        )
        .then(function(res) {
          if (res.rowCount === 1) {
            // Found user - Test if the supplied password is correct
            const row = res.rows[0];
            const incomming = sha512(data.password, row.passwdsalt);
            if (incomming.passwordHash === row.passwdhash) {
              // Return a new token to the verified user
              return newToken(row.id, row.email).then(function(token) {
                log("User '" + row.email + "' signed in. Return token.");
                return fulfill({ userId: row.id, token });
              });
            } else {
              log("Invalid password for user: " + data.email);
              return reject([{ hint: "auth", error: errorCode.invalidUser }]);
            }
          } else if (res.rowCount === 0) {
            // No such user
            return reject([{ hint: "auth", error: errorCode.invalidUser }]);
          } else {
            // DB returned multiple columns (shouldn't occur)!?
            log(
              "Multiple matches on auth (" + data.auth + "): " + res.rowCount
            );
            return reject([{ hint: "auth", error: errorCode.internal }]);
          }
        })
        .catch(function(err) {
          log(
            "db error (" + JSON.stringify(data) + "): " + JSON.stringify(err)
          );
          return reject([{ hint: "auth", error: errorCode.internal }]);
        });
    }
  });
}

function searchUserValidate({ rdb }, data) {
  return Promise.resolve();
}

function searchUser({ rdb }, data) {
  return Promise.resolve();
}

const handlers = [
  {
    name: "user:create",
    mustBeAuthed: false,
    validate: createUserValidate,
    handler: createUser
  },
  {
    name: "user:login",
    mustBeAuthed: false,
    validate: loginUserValidate,
    handler: loginUser
  },
  {
    name: "user:search",
    mustBeAuthed: true,
    validate: searchUserValidate,
    handler: searchUser
  }
];

module.exports = handlers;
