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
function createUserValidate({ rdb }, data) {
  return new Promise(function(fulfill, reject) {
    let errorArray = [];

    if (!data.alias || data.alias.length < 2) {
      errorArray.push({ hint: "alias", error: errorCode.invalidValue });
    }
    if (!data.email || data.email.length < 2) {
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
    return Promise.all([
      dbHelpers.columnValueCount(rdb, "user", { email: data.email }),
      dbHelpers.columnValueCount(rdb, "user", { alias: data.alias })
    ])
      .then(function(result) {
        if (result[0] > 0) {
          errorArray.push({
            hint: "email",
            error: errorCode.inUse
          });
        }
        if (result[1] > 0) {
          errorArray.push({
            hint: "alias",
            error: errorCode.inUse
          });
        }
        if (errorArray.length > 0) {
          return reject(errorArray);
        }
        return fulfill();
      })
      .catch(function(error) {
        reject([{ error: errorCode.internal }]);
      });
  });
}

// Create user
function createUser({ rdb }, data) {
  // Create a hashed password and insert user in db
  return new Promise(function(fulfill, reject) {
    const passwordData = sha512(data.password, randomString(16));
    return rdb
      .table("user")
      .insert({
        email: data.email,
        name: data.name,
        alias: data.alias,
        passwordData: passwordData,
        timeOfCreation: rdb.now()
      })
      .run()
      .then(function(result) {
        if (result.errors) {
          log("Error creating user: " + JSON.stringify(result));
          return Promise.reject(new Error(result.first_error));
        } else {
          const userId = result.generated_keys[0];
          return newToken(userId, data.email).then(function(token) {
            log("Created user " + data.alias + " (" + userId + ")");
            return fulfill({ userId, token });
          });
        }
      })
      .catch(function(error) {
        log("Error creating user (" + data + "): " + error);
        reject([{ error: errorCode.internal }]);
      });
  });
}

// Validate create:user parameters
function loginUserValidate({ rdb }, data) {
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

function loginUser({ rdb }, data) {
  return new Promise(async function(fulfill, reject) {
    if (data.token) {
      // Received token for authentication
      log("Got token");
      jwt.verify(data.token, config.jwt.secret, function(err, decoded) {
        if (err) {
          log("Invalid token: " + JSON.stringify(err));
          return reject([{hint: 'token', error: errorCode.invalidToken}]);
        } else {
          // Issue a (new) token to user

          return newToken(decoded.userId, decoded.email).then(function(token) {
            log("User '" + decoded.email + "' signed in. Return token.");
            return fulfill({ userId: decoded.userId, token: token });
          }).catch(function(error) {
            log("Error creating token: " + error);
          })
        }
      });
    } else {
      // Received email and password for authentication
      log("Got auth");
      let result = await dbHelpers.getAnyOf(
          rdb, 'user', [ {email : data.auth}, {alias : data.auth} ]);
      if (result.length !== 0) {
        // Test if the supplied password is correct

        const user = result[0];
        const passwordData = sha512(data.password, user.passwordData.salt);
        if (passwordData.passwordHash === user.passwordData.passwordHash) {
          // Return a new token to the verified user

          return newToken(user.id, data.email).then(function(token) {
            log("User '" + data.email + "' signed in. Return token.");
            fulfill({ userId: user.id, token });
          });
        } else {
          log("Invalid password for user: " + data.email);
        }
      } else {
        log("No such user: " + data.email);
      }      
    }
  });
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
  }
];

module.exports = handlers;
