const config = {
  rethink : {host : '172.17.0.2', port : 28015, db : 'pingpong'},
  express : {port : 3000},
  jwt : {
    expiration : process.env.TOKEN_EXPIRATION || 60 * 60,
    secret : process.env.TOKEN_SECRET || 'replaceMePlz'
  }
};

module.exports = config;
