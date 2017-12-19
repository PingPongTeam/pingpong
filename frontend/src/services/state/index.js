import { observable } from 'mobx';

var state = observable({
  connectedToServer: false,
  loggedIn: false,
  tryingLogin: false,
  initInProcess: true,
});

window.state = state;
export default state;


// import { extendObservable, observable, autorun } from 'mobx';