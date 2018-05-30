import io from 'socket.io-client';
import state from 'services/state';
import matches from 'services/state/matches';
import { user } from './user';

let backendPort = process.env.REACT_APP_WS_PORT || window.location.port;
let backendUrl = process.env.REACT_APP_WS_HOST || window.location.hostname;
backendUrl += backendPort ? ( ':' + backendPort ) : "";
// export const socket = io(backendHost + ':' + backendPort);
export const socket = io(backendUrl);
console.log("connecting to socket url: " + backendUrl);

socket.on('connect', () => {
  state.connectedToServer = true;
  if (window.localStorage.getItem('jwt') !== null) {
    user.loginToken();
  } else {
    state.initInProcess = false;
  }
});

socket.on('user:token', message => {
  if (message.destroy === true) {
    window.localStorage.removeItem('jwt');
  }
  if (message.new) {
    window.localStorage.setItem('jwt', message.newToken);
  }
});

socket.on('match:created', match => {
  console.log('GOT NEW MATCH IN REAL TIME!: ' + JSON.stringify(match));
  matches.history.unshift(match);
});
