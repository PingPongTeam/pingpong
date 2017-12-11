import io from 'socket.io-client';
import state from 'services/state';
import { user } from './user';

export const socket = io('http://10.10.50.121:3001');

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