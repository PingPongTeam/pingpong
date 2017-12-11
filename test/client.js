const io = require('socket.io-client');

var socket = io.connect('http://localhost:3001');
socket.on('connect', function() {
  const email = "user_" + Math.floor((Date.now() / 1000)).toString() + "@host.com";
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
      });
});
