import state from 'services/state';
import { socket } from './';

export const user = {};

user.create = ({ name, email, password }) => {
  socket.emit('user:create', { name, email, password }, response => {
    if ( response.status === 0 ) {
      state.loggedIn = true;
      window.localStorage.setItem('jwt', response.token);
    }
  });
};

user.loginEmailPass = ({ email, password }) => {
  return new Promise((resolve, reject) => {
    socket.emit('user:login', { email, password }, 
    response => {
      console.log('got response', response);
      resolve(response);
    });
  });
};

user.loginToken = () => {
  socket.emit(
    'user:login',
    { token: window.localStorage.getItem('jwt') },
    response => {
      if ( response.status === 0 ) {
        state.loggedIn = true;
      } else if ( response.status === 1 ) {
        state.loggedIn = false;
        if ( response.errors && response.errors[0].errorCode === 902 ) {
          window.localStorage.removeItem('jwt');
        }
      }
      state.initInProcess = false;
    }
  );
};