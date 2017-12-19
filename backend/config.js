const config = {
  rethink : {
    host : process.env.RETHINKDB_HOST || '172.17.0.2',
    port : process.env.RETHINKDB_PORT || 28015,
    db : process.env.RETHINKDB_DATABASE || 'pingpong'
  },
  express : {port : process.env.SOCKETIO_SERVER_PORT || 3001},
  jwt : {
    expiration : process.env.TOKEN_EXPIRATION || 60 * 60,
    secret : process.env.TOKEN_SECRET || 'replaceMePlz'
  }
};

module.exports = config;
