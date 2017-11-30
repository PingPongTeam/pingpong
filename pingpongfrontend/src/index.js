import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import 'normalize.css';
import 'baseStyles.css';
import { socket } from 'services/api';

socket.on('connect', () => {
  console.log('CONNECTED!!!W WOOOOO');
  socket.emit('Huddik suger', 'true');
});

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
