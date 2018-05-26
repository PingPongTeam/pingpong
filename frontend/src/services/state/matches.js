import { decorate, observable, computed } from 'mobx';

class Matches {
  history = [];
  get total() {
    let wins = 0;
    let losses = 0;
    this.history.forEach(match => {
      const user = match.player.filter(player => {
        // TODO: Is it OK to access state like this (window.user etc)?
        return player.id === window.user.userId;
      });
      const opponent = match.player.filter(player => {
        return player.id !== window.user.userId;
      });

      if (user[0].score > opponent[0].score) {
        wins++;
      } else {
        losses++;
      }
    });
    return { wins, losses };
  }
}

decorate(Matches, {
  history: observable,
  total: computed
});

const instant = new Matches();
window.matches = instant;
export default instant;
