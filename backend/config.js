const config = {
  db: {
    uri:
      process.env.DB_URI ||
      "postgresql://pingpong:pingpongpassword@10.10.50.121:5432/pingpong"
  },
  express: { port: process.env.SOCKETIO_SERVER_PORT || 3001 },
  jwt: {
    expiration: process.env.TOKEN_EXPIRATION || 60 * 60,
    secret: process.env.TOKEN_SECRET || "replaceMePlz"
  }
};

module.exports = config;
