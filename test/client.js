const io = require('socket.io-client');

var socket = io.connect('http://localhost:3000');
socket.on('connect', function() {
  socket.emit(
      'user:signup', {
        email : "user@host.com",
        name : "Some User",
        password : "WithAVeryGoodPassword"
      },
      function(result) { console.log("Result: " + JSON.stringify(result)); });
});
