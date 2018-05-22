import { Component } from 'react';
import matches from 'services/state/matches';
import userState from 'services/state/user';
import logoutRoutine from 'services/routines/logout';
import { observer } from 'mobx-react';
import Render from './render';

class DashboardCotainer extends Component {
  constructor() {
    super();
    this.handleLogout = this.handleLogout.bind(this);
  }

  handleLogout() {
    logoutRoutine();
  }

  render() {
    return Render({
      matches,
      handleLogout: this.handleLogout,
      userId: userState.getUser().userId
    });
  }
}

export default observer(DashboardCotainer);
