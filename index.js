const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));

server.listen(3000);
