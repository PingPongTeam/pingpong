import { decorate, observable } from 'mobx';

let matchHistory = {
  matches: []
};

decorate(matchHistory, {
  matches: observable
});

window.matches = matchHistory;
export default matchHistory;
