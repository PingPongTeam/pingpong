import { socket } from './';

export const match = {};

match.create = ({ player1, player2 }) => {
  console.log('MATCH:CREATE SENDING:', { player1, player2 });
  return new Promise((resolve, reject) => {
    socket.emit('match:create', { player1, player2 }, response => {
      if (response.status === 0) {
        console.log('match created successfully:', response.result);
        resolve(response.result);
      } else {
        console.log('match creation failed:', response.errors);
        reject(response.errors);
      }
    });
  });
};
