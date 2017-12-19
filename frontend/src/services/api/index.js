import io from 'socket.io-client';
import state from 'services/state';
import { user } from './user';

let backendHost = '';
let backendPort = '';

if (process.env.BACKEND_HOST == null){
  backendHost = 'localhost';
} else{
  backendHost = process.env.BACKEND_HOST;
}
if (process.env.BACKEND_PORT == null){
  backendPort = ':3001';
} else{
  backendPort = ':' + process.env.BACKEND_PORT;
}

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