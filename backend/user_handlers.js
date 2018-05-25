const AccessLevel = require("./access_level.js");
const config = require("./config.js");
const common = require("./common.js");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const hash = crypto.createHash("sha256");
const dbHelpers = require("./db_helpers.js");
const errorCode = require("./error_code.js");
const validation = require("./validation.js");
const Op = require("sequelize").Op;

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

// Validate create:user parameters
function createUserValidate(ctx, data) {
  return validation.validate(data, "/UserCreate");
}

// Create user'
function createUser(user, { data, replyOK, replyFail }) {
  let db = user.db;
  // Create a hashed password and insert user in db
  const passwdSalt = randomString(16);
  const passwdHash = sha512(data.password, passwdSalt);
  db.User.findOrCreate({
    where: {
      [Op.or]: [{ email: data.email }, { alias: data.alias }]
    },
    defaults: {
      email: data.email,
      alias: data.alias,
      name: data.name,
      passwdHash: passwdHash,
      passwdSalt: passwdSalt
    }
  }).spread((result, created) => {
    if (created) {
      // User was created - Generate token and return
      let userId = result.id;
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
    } else {
      // Email and/or alias in use
      // TODO: Check for both alias and/or email. Now first occurence is acted upon.
      let errorArray = [];
      if (result.alias === data.alias) {
        errorArray.push({
          hint: "alias",
          error: errorCode.inUse
        });
      }
      if (result.email === data.email) {
        errorArray.push({
          hint: "email",
          error: errorCode.inUse
        });
      }
      replyFail(errorArray);
    }
  });
}

function removeUserValidate(user, data) {
  return validation.validate(data.password, "/Password", { hint: "password" });
}

function removeUser(user, { data, replyOK, replyFail }) {
  // Remove the logged in user
  const db = user.db;
  const incommingHash = sha512(data.password, user.auth.passwdSalt);
  if (incommingHash !== user.auth.passwdHash) {
    replyFail([{ hint: "password", error: errorCode.invalidValue }]);
  } else {
    // Remove account and logout user
    db.User.destroy({ where: { id: user.info.userId } }).then(result => {
      if (result) {
        user.log("User account deleted");
      }
      user.logout();
      replyOK({});
    });
  }
}

// Validate login:user parameters
function loginUserValidate(user, data) {
  if (data.token) {
    return validation.validate(data, "/UserLoginToken");
  } else {
    return validation.validate(data, "/UserLoginAuth");
  }
}

function loginUser(user, { data, replyOK, replyFail }) {
  let db = user.db;
  if (data.token) {
    // Received token for authentication
    jwt.verify(data.token, config.jwt.secret, (err, decoded) => {
      if (err) {
        user.log("Invalid token: " + JSON.stringify(err));
        replyFail([{ hint: "token", error: errorCode.invalidToken }]);
      } else {
        // Ensure that user exists in db
        db.User.findById(decoded.userId).then(result => {
          if (result) {
            const userInfo = {
              userId: result.id,
              alias: result.alias,
              email: result.email,
              name: result.name
            };
            const userAuth = {
              token: data.token,
              passwdHash: result.passwdHash,
              passwdSalt: result.passwdSalt
            };
            newToken(result.id, result.email)
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
          } else {
            replyFail([{ hint: "token", error: errorCode.invalidUser }]);
          }
          user.log("*********************" + JSON.stringify(result));
        });
      }
    });
  } else {
    // Received alias/email and password for authentication
    // Ensure that user exists in db
    db.User.findAll({
      where: { [Op.or]: [{ email: data.auth }, { alias: data.auth }] }
    }).then(result => {
      user.log("*********************" + JSON.stringify(result));
      if (result.length === 1) {
        // User found
        let row = result[0];
        const incomming = sha512(data.password, row.passwdSalt);
        if (incomming === row.passwdHash) {
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
                passwsHash: row.passwdHash,
                passwdSalt: row.passwdSalt
              };
              user.login(userInfo, userAuth, AccessLevel.user);
              replyOK({
                userObject: userInfo,
                token: token
              });
            })
            .catch(err => {
              user.log("Token error: " + err);
            });
        } else {
          user.log("Invalid password for user: " + data.auth);
          replyFail([{ hint: "auth", error: errorCode.invalidUser }]);
        }
      } else if (result.length === 0) {
        // No such user
        replyFail([{ hint: "auth", error: errorCode.invalidUser }]);
      } else if (result.length > 1) {
        user.log(
          "Multiple matches on auth (" + data.auth + "): " + result.length
        );
        replyFail([{ hint: "auth", error: errorCode.internal }]);
      }
    });
  }
}

function logoutUserValidate(user, data) {
  return [];
}

function logoutUser(user, { data, replyOK, replyFail }) {
  if (user.accessLevel) {
    user.logout();
  }
  replyOK({});
}

function searchUserValidate(ctx, data) {
  return validation.validate(data, "/SearchUser");
}

function searchUser(user, { data, replyOK, replyFail }) {
  const db = user.db;
  const searchExp = (data.aliasOrEmail + "%").toString();
  db.User.findAll({
    where: {
      [Op.and]: [
        { id: { [Op.not]: user.info.userId } },
        {
          [Op.or]: [
            { email: { [Op.iLike]: searchExp } },
            { alias: { [Op.iLike]: searchExp } }
          ]
        }
      ]
    }
  }).then(result => {
    user.log("Users: " + result.length + ": " + JSON.stringify(result));
    const users = result.map(row => {
      return {
        userId: row.id,
        name: row.name,
        alias: row.alias,
        email: row.email
      };
    });
    replyOK(users);
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
