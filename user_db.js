const config = require('./config.js');
const common = require('./common.js');
const jwt = require('jsonwebtoken');
const log = common.log;
const r = require('rethinkdbdash')(config.rethink);
const crypto = require('crypto');
const hash = crypto.createHash('sha256');

function newToken(userId, email, expirationTime)
{
  return new Promise(function(fulfill, reject) {
    expirationTime = expirationTime || config.jwt.expiration;
    jwt.sign({userId : userId, email : email}, config.jwt.secret,
             {expiresIn : expirationTime}, function(err, token) {
               if (err) {
                 reject(new Error("Error signing token: " + err));
               } else {
                 fulfill(token);
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
  create(data, answer)
  {
    // TODO: Should verify that the email is a valid address
    var self = this;
    this.r.table('users')
        .filter({'email' : data.email})
        .run()
        .then(function(result) {
          if (result.length !== 0) {
            // User with this email already exists in database
            log("Email '" + data.email + "' is already registered");
            answer({
              status : 1,
              errors : [ {message : "email is already registered"} ]
            });
            return Promise.resolve();
          }

          // Create user
          const passwordData = sha512(data.password, randomString(16));
          return self.r.table('users')
              .insert({
                email : data.email,
                name : data.name,
                passwordData : passwordData,
                timeOfCreation : self.r.now()
              })
              .run()
              .then(function onCreatedUser(result) {
                if (result.errors) {
                  log("Error creating user: " + JSON.stringify(result));
                  return Promise.reject(new Error(result.first_error));
                } else {
                  const userId = result.generated_keys[0];
                  log("New user '" + userId + " (email: " + data.email +
                      ") created.");
                  return newToken(userId, data.email).then(function(token) {
                    log("User '" + data.email + "' created. Return token.");
                    answer({status : 0, token : token});
                    return Promise.resolve();
                  });
                }
              })
              .catch(function creatUserError(error) {
                log("Error creating user: " + error);
                answer({status : 500, errors : [ error ]});
              });
        });
  }

  // User login
  login(data, answer)
  {
    if (data.token) {

      // Received token for authentication

      jwt.verify(data.token, config.jwt.secret, function(err, decoded) {
        if (err) {
          log("Error verifying token: " + err);
          answer({status : 1, errors : [ {message : "invalid token"} ]});
        } else {
          log(JSON.stringify(decoded));
          log("User '" + decoded.userId + "' (email: " + decoded.email +
              ") signed in.");

          // Issue a (new) token to user

          newToken(decoded.userId, decoded.email).then(function(token) {
            log("User '" + data.email + "' signed in. Return token.");
            answer({status : 0, token : token});
          });
        }
      });

    } else {

      // Received email and password for authentication

      this.r.table('users')
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
                  answer({status : 0, token : token});
                });

              } else {
                log("Invalid password for user: " + data.email);
              }
            } else {
              log("No such user: " + data.email);
            }

            // Return invalid user for both incorrect password and non existing
            // account.
            answer({status : 1, errors : [ {message : "invalid user"} ]});
            return Promise.resolve();
          })
          .catch(function(error) {
            log("Error signing in user: " + error);
            answer({status : 500, errors : [ error ]});
          });
    }
  }
}

module.exports = UserDb;
