import { decorate, observable } from 'mobx';

let state = {
  matches: []
};

decorate(state, {
  matches: observable
});

window.matches = state;
export default state;
