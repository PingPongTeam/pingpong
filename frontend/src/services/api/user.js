import state from 'services/state';
import loginRoutine from 'services/routines/login';
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
        window.localStorage.setItem('jwt', response.result.token);
        user.loginToken();
      } else if (response.errors) {
        reject(response.errors);
      }
    });
  });
};

user.loginEmailOrAliasPass = async ({ auth, password }) => {
  return new Promise((resolve, reject) => {
    socket.emit('user:login', { auth, password }, async response => {
      if (response.status === 0) {
        await loginRoutine(response.result);
      } else {
        console.log('login fail', response);
        reject(response);
      }
    });
  });
};

user.loginToken = async () => {
  socket.emit(
    'user:login',
    { token: window.localStorage.getItem('jwt') },
    async response => {
      if (response.status === 0) {
        if (response.result.token) {
          await loginRoutine(response.result);
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
