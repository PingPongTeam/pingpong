import { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Render from './render';
import userState from 'services/state/user';
import { match } from 'services/api/match';

class MatchContainer extends Component {
  constructor(props) {
    super(props);
    this.addPoint = this.addPoint.bind(this);
    this.subtractPoint = this.subtractPoint.bind(this);
    this.submitMatch = this.submitMatch.bind(this);
    this.state = {
      submittingMatch: false,
      player: [
        {
          ...userState.getUser(),
          score: 0
        },
        {
          ...this.props.location.state.opponent,
          score: 0
        }
      ]
    };
    console.log('STATE:', this.state);
  }

  addPoint(player) {
    console.log(this.state.player[player]);
    this.setState(prevState => ({
      player: [
        ...prevState.player,
        (prevState.player[player].score = prevState.player[player].score + 1)
      ]
    }));
  }
  subtractPoint(player) {
    this.setState(prevState => {
      const newScore =
        prevState.player[player].score <= 0
          ? 0
          : prevState.player[player].score - 1;
      return {
        player: [
          ...prevState.player,
          (prevState.player[player].score = newScore)
        ]
      };
    });
    console.log(this.state.player[player]);
  }

  async submitMatch() {
    this.setState(() => ({
      submittingMatch: true
    }));
    const player1 = {
      id: this.state.player[0].userId,
      score: this.state.player[0].score
    };
    const player2 = {
      id: this.state.player[1].userId,
      score: this.state.player[1].score
    };
    try {
      await match.create({ player1, player2 });
      this.props.history.push('/');
    } catch (e) {
      console.log('errorrrrrrrr');
    }
    this.setState(() => ({
      submittingMatch: false
    }));
  }

  render() {
    const { player, submittingMatch } = this.state;
    return Render({
      player,
      submittingMatch,
      addPoint: this.addPoint,
      subtractPoint: this.subtractPoint,
      submitMatch: this.submitMatch
    });
  }
}

export default withRouter(MatchContainer);
