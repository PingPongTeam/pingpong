import React, { Component } from 'react';
import matchHistory from 'services/state/matchHistory';
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
      matchList: matchHistory.matches,
      handleLogout: this.handleLogout
    });
  }
}

export default observer(DashboardCotainer);
