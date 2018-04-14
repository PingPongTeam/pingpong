const AccessLevel = require("./access_level.js");
const config = require("./config.js");
const common = require("./common.js");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const hash = crypto.createHash("sha256");
const validator = require("validator");
const dbHelpers = require("./db_helpers.js");
const errorCode = require("./error_code.js");

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
  const hash = crypto.createHmac("sha512", salt);
  hash.update(password);
  return hash.digest("hex");
}

const aliasOrEmailRegex = new RegExp("^[a-zA-Z0-9_@.-]*$", "i");
const aliasRegex = new RegExp("^[a-zA-Z0-9]+([_-]?[a-zA-Z0-9])*$", "i");
function validateAlias(alias) {
  return aliasRegex.test(alias);
}

function validateEmail(email) {
  return validator.isEmail(email);
}
function validateName(name) {
  // TODO
  return name && name.length && name.length > 0;
}

// Validate create:user parameters
function createUserValidate(ctx, data) {
  let errorArray = [];

  if (!validateAlias(data.alias)) {
    errorArray.push({ hint: "alias", error: errorCode.invalidValue });
  }
  if (!validateEmail(data.email)) {
    errorArray.push({ hint: "email", error: errorCode.invalidValue });
  }
  if (!validateName(data.name)) {
    errorArray.push({ hint: "name", error: errorCode.invalidValue });
  }
  if (!data.password || data.password.length < 2) {
    errorArray.push({ hint: "password", error: errorCode.invalidValue });
  }
  if (errorArray.length > 0) {
    return Promise.reject(errorArray);
  }
  return Promise.resolve();
}

// Create user'
function createUser(user, { data, replyOK, replyFail }) {
  let pgp = user.pgp;
  // Create a hashed password and insert user in db
  const passwdSalt = randomString(16);
  const passwdHash = sha512(data.password, passwdSalt);
  pgp.query(
    "INSERT into users(email, alias, name, passwd_hash, passwd_salt) VALUES " +
      "($1, $2, $3, $4, $5) RETURNING id;",
    [data.email, data.alias, data.name, passwdHash, passwdSalt],
    (err, result) => {
      if (err && err.code === "23505") {
        // Either alias or email (or both) was not unique. Test which one(s).
        pgp.query(
          "SELECT id, email, alias FROM users WHERE email = $1 OR alias = $2;",
          [data.email, data.alias],
          (err, result) => {
            let errorArray = [];
            if (err) {
              user.log("unhandled db error: " + JSON.stringify(err));
              errorArray.push({ error: errorCode.internal });
            } else {
              result.rows.forEach(row => {
                if (row.alias === data.alias) {
                  errorArray.push({
                    hint: "alias",
                    error: errorCode.inUse
                  });
                }
                if (row.email === data.email) {
                  errorArray.push({
                    hint: "email",
                    error: errorCode.inUse
                  });
                }
              });
            }
            replyFail(errorArray);
          }
        );
      } else if (err) {
        user.log("unhandled db error: " + JSON.stringify(err));
        replyFail([{ error: errorCode.internal }]);
      } else {
        // User was created - Generate token and return
        let userId = result.rows[0].id;
        newToken(userId, data.email)
          .then(token => {
            user.log("Created user " + data.alias + " (" + userId + ")");
            replyOK({
              userObject: {
                userId: userId,
                email: data.email,
                alias: data.alias,
                name: data.name
              },
              token: token
            });
          })
          .catch(err => {
            user.log("Token error: " + err);
          });
      }
    }
  );
}

function removeUserValidate(user, data) {
  if (!data.password || !data.password.length) {
    Promise.reject([{ hint: "password", error: errorCode.missingValue }]);
  }
  return Promise.resolve();
}

function removeUser(user, { data, replyOK, replyFail }) {
  // Remove the logged in user
  const pgp = user.pgp;
  const incommingHash = sha512(data.password, user.auth.passwdSalt);
  if (incommingHash !== user.auth.passwdHash) {
    replyFail([{ hint: "password", error: errorCode.invalidValue }]);
  } else {
    // Remove account and logout user
    pgp
      .query("DELETE FROM users WHERE id = $1;", [user.info.userId])
      .then(res => {
        user.log("User account deleted");
        user.logout();
        replyOK({});
      });
  }
}

// Validate login:user parameters
function loginUserValidate(user, data) {
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

function loginUser(user, { data, replyOK, replyFail }) {
  let pgp = user.pgp;
  if (data.token) {
    // Received token for authentication
    jwt.verify(data.token, config.jwt.secret, (err, decoded) => {
      if (err) {
        user.log("Invalid token: " + JSON.stringify(err));
        replyFail([{ hint: "token", error: errorCode.invalidToken }]);
      } else {
        // Ensure that user exists in db
        pgp
          .query(
            "SELECT id, email, alias, name, passwd_hash, passwd_salt" +
              " FROM users WHERE id = $1;",
            [decoded.userId]
          )
          .then(res => {
            if (res.rowCount !== 1) {
              replyFail([{ hint: "token", error: errorCode.invalidUser }]);
            } else {
              let row = res.rows[0];
              const userInfo = {
                userId: row.id,
                alias: row.alias,
                email: row.email,
                name: row.name
              };
              const userAuth = {
                token: data.token,
                passwdHash: row.passwd_hash,
                passwdSalt: row.passwd_salt
              };
              newToken(row.id, row.email)
                .then(token => {
                  user.login(userInfo, userAuth, AccessLevel.user);
                  replyOK({
                    userObject: userInfo,
                    token: data.token
                  });
                })
                .catch(err => {
                  user.log("Token error: " + err);
                  replyFail([{ error: errorCode.internal }]);
                });
            }
          })
          .catch(err => {
            user.log("db error (" + JSON.stringify(data) + "): " + err);
          });
      }
    });
  } else {
    // Received alias/email and password for authentication
    pgp
      .query(
        "SELECT id, email, alias, name, passwd_hash, passwd_salt" +
          " FROM users WHERE email = $1 OR alias = $1;",
        [data.auth]
      )
      .then(res => {
        if (res.rowCount === 1) {
          // Found user - Test if the supplied password is correct
          const row = res.rows[0];
          const incomming = sha512(data.password, row.passwd_salt);
          if (incomming === row.passwd_hash) {
            // Return a new token to the verified user
            newToken(row.id, row.email)
              .then(token => {
                // Mark user as authed and signed in
                const userInfo = {
                  userId: row.id,
                  alias: row.alias,
                  email: row.email,
                  name: row.name
                };
                const userAuth = {
                  token: token,
                  passwsHash: row.passwd_hash,
                  passwdSalt: row.passwd_salt
                };
                user.login(userInfo, userAuth, AccessLevel.user);
                replyOK({
                  userObject: userInfo,
                  token: token
                });
              })
              .catch(err => {
                user.log("T!oken error: " + err);
              });
          } else {
            user.log("Invalid password for user: " + data.auth);
            replyFail([{ hint: "auth", error: errorCode.invalidUser }]);
          }
        } else if (res.rowCount === 0) {
          // No such user
          replyFail([{ hint: "auth", error: errorCode.invalidUser }]);
        } else {
          // DB returned multiple columns (shouldn't occur)!?
          user.log(
            "Multiple matches on auth (" + data.auth + "): " + res.rowCount
          );
          replyFail([{ hint: "auth", error: errorCode.internal }]);
        }
      })
      .catch(err => {
        user.log("db error (" + JSON.stringify(data) + "): " + err);
        replyFail([{ hint: "auth", error: errorCode.internal }]);
      });
  }
}

function logoutUserValidate(user, data) {
  return Promise.resolve();
}

function logoutUser(user, { data, replyOK, replyFail }) {
  if (user.accessLevel) {
    user.logout();
  }
  replyOK({});
}

function searchUserValidate(ctx, data) {
  let errorArray = [];
  if (!data.aliasOrEmail) {
    errorArray.push({ hint: "aliasOrEmail", error: errorCode.missingValue });
  } else if (
    data.aliasOrEmail.lenght < 2 ||
    !aliasOrEmailRegex.test(data.aliasOrEmail)
  ) {
    errorArray.push({ hint: "aliasOrEmail", error: errorCode.invalidValue });
  } else {
    return Promise.resolve();
  }
  return Promise.reject(errorArray);
}

function searchUser(user, { data, replyOK, replyFail }) {
  const pgp = user.pgp;
  pgp
    .query(
      `SELECT id, alias, email, name
       FROM users WHERE NOT id = $1 AND
       (email ILIKE $2 OR alias ILIKE $2);`,
      [user.info.userId, data.aliasOrEmail + "%"]
    )
    .then(result => {
      const users = result.rows.map(row => {
        return {
          userId: row.id,
          name: row.name,
          alias: row.alias,
          email: row.email
        };
      });
      replyOK(users);
    })
    .catch(err => {
      user.log("Error searching for user: " + err);
      replyFail([{ error: errorCode.internal }]);
    });
}

const handlers = {
  commands: [
    {
      name: "user:create",
      minAccessLevel: AccessLevel.any,
      validate: createUserValidate,
      handler: createUser
    },
    {
      name: "user:remove",
      minAccessLevel: AccessLevel.user,
      validate: removeUserValidate,
      handler: removeUser
    },
    {
      name: "user:login",
      minAccessLevel: AccessLevel.any,
      validate: loginUserValidate,
      handler: loginUser
    },
    {
      name: "user:logout",
      minAccessLevel: AccessLevel.any,
      validate: logoutUserValidate,
      handler: logoutUser
    },
    {
      name: "user:search",
      minAccessLevel: AccessLevel.user,
      validate: searchUserValidate,
      handler: searchUser
    }
  ]
};

module.exports = handlers;
