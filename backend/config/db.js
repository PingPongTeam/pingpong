const username = process.env.DB_USERNAME || "pingpong";
const password = process.env.DB_PASSWORD || "pingpongpassword";
const database = process.env.DB_NAME || "pingpong";
const host = process.env.DB_HOSTNAME || "localhost";

const config = {
  username: username,
  password: password,
  database: database,
  host: host,
  dialect: "postgresql",
  uri: "postgresql://" + username + ":" + password + "@" + host + "/" + database
};

module.exports = {
  development: config,
  test: config,
  production: config
};
