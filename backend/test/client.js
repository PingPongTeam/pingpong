const io = require('socket.io-client');
const config = require('../config.js');

var socket = io.connect('http://localhost:' + config.express.port.toString());
socket.on('connect', function() {
  socket.emit(
      'user:create',
      {name : "gren", email : "gren@mail.se", password : "gemigöl"},
      function(result) { console.log("Result: " + JSON.stringify(result)); });

  const email =
      "user_" + Math.floor((Date.now() / 1000)).toString() + "@host.com";

  socket.emit(
      'user:create',
      {email : email, name : "Some User", password : "WithAVeryGoodPassword"},
      function(result) {
        console.log("Result: " + JSON.stringify(result));

        socket.emit('user:login',
                    {email : email, password : "WithAVeryGoodPassword"},
                    function(result) {
                      console.log("Result: " + JSON.stringify(result));
                    });

        socket.emit('user:login', {token : result.token}, function(result) {
          console.log("Result: " + JSON.stringify(result));
        });
      });

  setTimeout(function() {
    let searchEmail = email.substring(0, 13);
    socket.emit('user:search', {filter: searchEmail}, function(result) {
      console.log("Users starting with '" + searchEmail +
                  "':" + JSON.stringify(result, null, 4));
    });
  }, 1000);
});
