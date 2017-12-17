const config = require('./config.js');
const common = require('./common.js');
const jwt = require('jsonwebtoken');
const log = common.log;
const r = require('rethinkdbdash')(config.rethink);
const crypto = require('crypto');
const hash = crypto.createHash('sha256');
const errorCode = require('./error_code.js');

function newToken(userId, email, expirationTime)
{
  return new Promise(function(resolve, reject) {
    expirationTime = expirationTime || config.jwt.expiration;
    jwt.sign({userId : userId, email : email}, config.jwt.secret,
             {expiresIn : expirationTime}, function(err, token) {
               if (err) {
                 reject(new Error("Error signing token: " + err));
               } else {
                 resolve(token);
               }
             });
  });
}

function randomString(length)
{
  return crypto.randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
}

function sha512(password, salt)
{
  var hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  var value = hash.digest('hex');
  return {salt : salt, passwordHash : value};
}

class UserDb {

  constructor(r)
  {
    this.r = r;
    log("Created user db object");
  }

  // Create user
  create(data)
  {
    // TODO: Should verify that the email is a valid address
    var self = this;
    return new Promise(function(resolve, reject) {
      self.r.table('users')
          .filter({'email' : data.email})
          .run()
          .then(function(result) {
            if (result.length !== 0) {

              // User with this email already exists in database

              log("Email '" + data.email + "' is already registered");
              reject([ errorCode.emailInUse ]);
              return Promise.resolve();
            } else {

              // Create a hashed password and insert user in db

              const passwordData = sha512(data.password, randomString(16));
              return self.r.table('users')
                  .insert({
                    email : data.email,
                    name : data.name,
                    passwordData : passwordData,
                    timeOfCreation : self.r.now()
                  })
                  .run()
                  .then(function(result) {
                    if (result.errors) {
                      log("Error creating user: " + JSON.stringify(result));
                      return Promise.reject(new Error(result.first_error));
                    } else {
                      const userId = result.generated_keys[0];
                      return newToken(userId, data.email).then(function(token) {
                        resolve({userId, token});
                      });
                    }
                  });
            }
          })
          .catch(function(error) {
            log("Error creating user: " + JSON.stringify(error));
            reject([ errorCode.internal ]);
          });
    });
  }

  // User login
  login(data)
  {
    var self = this;
    return new Promise(function(resolve, reject) {
      if (data.token) {

        // Received token for authentication

        jwt.verify(data.token, config.jwt.secret, function(err, decoded) {
          if (err) {
            log("Invalid token: " + JSON.stringify(err));
            reject([ errorCode.invalidToken ]);
          } else {

            // Issue a (new) token to user

            newToken(decoded.userId, decoded.email).then(function(token) {
              log("User '" + decoded.email + "' signed in. Return token.");
              resolve({userId : decoded.userId, token : token});
            });
          }
        });
      } else {

        // Received email and password for authentication

        self.r.table('users')
            .filter({'email' : data.email})
            .run()
            .then(function(result) {
              if (result.length !== 0) {

                // Test if the supplied password is correct

                const user = result[0];
                const passwordData =
                    sha512(data.password, user.passwordData.salt);
                if (passwordData.passwordHash ===
                    user.passwordData.passwordHash) {

                  // Return a new token to the verified user

                  return newToken(user.id, data.email).then(function(token) {
                    log("User '" + data.email + "' signed in. Return token.");
                    resolve({userId : user.id, token});
                  });

                } else {
                  log("Invalid password for user: " + data.email);
                }
              } else {
                log("No such user: " + data.email);
              }

              // Return invalid user for both incorrect password and non
              // existing account.
              reject([ errorCode.invalidUser ]);
            })
            .catch(function(error) {
              log("Error looking up user: " + error);
              reject([ errorCode.internal ]);
            });
      }
    });
  }
}

module.exports = UserDb;