const config = {
  express: { port: process.env.SOCKETIO_SERVER_PORT || 3001 },
  jwt: {
    expiration: process.env.TOKEN_EXPIRATION || 60 * 60,
    secret: process.env.TOKEN_SECRET || "replaceMePlz"
  }
};

module.exports = config;
