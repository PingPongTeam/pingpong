const io = require('socket.io-client');

var socket = io.connect('http://localhost:3000');
socket.on('connect', function() {
  const email = "user_" + (Date.now() / 1000).toString() + "@host.com";
  socket.emit(
      'user:signup', {
        email : email,
        name : "Some User",
        password : "WithAVeryGoodPassword"
      },
      function(result) { console.log("Result: " + JSON.stringify(result)); });
});
