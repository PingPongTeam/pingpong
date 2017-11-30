import { socket } from './';

export const user = {};

user.signup = ({ name, email, password }) => {
  console.log('herer too');
  socket.emit('user:signup', { name, email, password });
};

user.signin = ({ email, password }) => {
  console.log('emiting signin');
  socket.emit('user:signin', { email, password });
};