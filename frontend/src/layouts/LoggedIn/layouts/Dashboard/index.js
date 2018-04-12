import React, { Component } from 'react';
import matchHistory from 'services/state/matchHistory';
import match from 'services/api/match';
import Render from './render';

class DashboardCotainer extends Component {
  constructor() {
    super();
    this.state = {
      matches: []
    };
  }

  async componentWillMount() {
    try {
      const result = await match.get();
      this.setState(() => ({ matches: result.matches }));
    } catch (e) {
      console.log('lol');
    }
  }

  render() {
    return Render({
      matchList: this.state.matches
    });
  }
}

export default DashboardCotainer;
