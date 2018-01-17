import io from 'socket.io-client';
import state from 'services/state';
import { user } from './user';

let backendHost = process.env.BACKEND_HOST || 'localhost';
let backendPort = ':' + process.env.BACKEND_PORT || ':3001';

// backendHost = '10.10.50.121';

export const socket = io(backendHost + backendPort);


socket.on('connect', () => {
  state.connectedToServer = true;
  if ( window.localStorage.getItem('jwt') !== null ) {
    user.loginToken();
  } else {
    state.initInProcess = false;
  }
});

socket.on('user:token', message => {
  if ( message.destroy === true ) {
    window.localStorage.removeItem('jwt');
  }
  if ( message.new ) {
    window.localStorage.setItem('jwt', message.newToken);
  }
});