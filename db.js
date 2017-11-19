const Client = require('pg').Client;

const client = new Client();
var DB = {};

client.connect();

DB.registerPlayer = async function(playerName, initialScore) {
    const query = {text: 'INSERT INTO player (name, score) VALUES ($1, $2)',
                   values: [ playerName, initialScore ]};
    const res = await client.query(query);
    console.log(res);
    return res;
};

DB.getPlayers = async function() {
    const res = await client.query('SELECT * FROM player')
    return res.rows;
};

module.exports = DB;
