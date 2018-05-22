import { decorate, observable } from 'mobx';

var userState = {
  userId: null,
  email: null,
  alias: null,
  name: null,

  setUser(userObject) {
    this.userId = userObject.userId;
    this.email = userObject.email;
    this.alias = userObject.alias;
    this.name = userObject.name;
  },

  getUser() {
    return {
      userId: this.userId,
      email: this.email,
      alias: this.alias,
      name: this.name
    };
  }
};

decorate(userState, {
  id: observable,
  email: observable,
  alias: observable,
  name: observable
});

window.user = userState;
export default userState;
