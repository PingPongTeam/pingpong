import { socket } from './';

export const signup = ({name, email, password}) => {
  console.log('herer too');
  socket.emit('user:signup', { name, email, password });
};