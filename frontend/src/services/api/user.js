import state from 'services/state';
import { socket } from './';

export const user = {};

user.search = ({ searchTerm }) => {
  return new Promise((resolve, reject) => {
    socket.emit('user:search', { searchTerm }, response => {
      if (response.status === 0) {
        resolve(response.result);
      } else if (response.errors) {
        reject(response.errors);
      }
    });
  });
};

user.create = ({ name, email, alias, password }) => {
  return new Promise((resolve, reject) => {
    socket.emit('user:create', { name, email, alias, password }, response => {
      if (response.status === 0) {
        state.loggedIn = true;
        window.localStorage.setItem('jwt', response.token);
      } else if (response.errors) {
        reject(response.errors);
      }
    });
  });
};

user.loginEmailOrAliasPass = ({ auth, password }) => {
  return new Promise((resolve, reject) => {
      socket.emit('user:login', { auth, password }, response => {
      if (response.status === 0) {
        state.loggedIn = true;
        window.localStorage.setItem('jwt', response.token);
      } else {
        reject(response);
      }
    });
  });
};

user.loginToken = () => {
  socket.emit(
    'user:login',
    { token: window.localStorage.getItem('jwt') },
    response => {
      if (response.status === 0) {
        state.loggedIn = true;
      } else if (response.status === 1) {
        state.loggedIn = false;
        if (response.errors && response.errors[0].error === "InvalidToken") {
          window.localStorage.removeItem('jwt');
        }
      }
      state.initInProcess = false;
    }
  );
};
