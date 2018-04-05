import state from 'services/state';
import userState from 'services/state/user';
import { socket } from './';

export const user = {};

user.search = ({ searchTerm }) => {
  console.log('USER:SEARCH SENDING:', { aliasOrEmail: searchTerm });
  return new Promise((resolve, reject) => {
    socket.emit('user:search', { aliasOrEmail: searchTerm }, response => {
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
        console.log('userObject:', response.result.userObject);
        userState.setUser(response.result.userObject);
        window.localStorage.setItem('jwt', response.result.token);
        state.loggedIn = true;
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
        console.log('login success', response);
        state.loggedIn = true;
        console.log('userObject:', response.result.userObject);
        userState.setUser(response.result.userObject);
        window.localStorage.setItem('jwt', response.result.token);
      } else {
        console.log('login fail', response);
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
        if (response.result.token) {
          console.log('userObject:', response.result.userObject);
          userState.setUser(response.result.userObject);
          // Got new token - Store it
          window.localStorage.setItem('jwt', response.result.token);
          state.loggedIn = true;
        }
      } else if (response.status === 1) {
        state.loggedIn = false;
        if (response.errors && response.errors[0].error === 'InvalidToken') {
          window.localStorage.removeItem('jwt');
        }
      }
      state.initInProcess = false;
    }
  );
};
