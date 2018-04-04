import { Component } from 'react';
import Render from './render';

class MatchContainer extends Component {
  constructor(props) {
    super(props);
    this.addPoint = this.addPoint.bind(this);
    this.subtractPoint = this.subtractPoint.bind(this);
    this.state = {
      player: [
        {
          alias: 'Gren',
          id: 2,
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
    console.log(this.state.player[player]);
    this.setState(prevState => ({
      player: [
        ...prevState.player,
        (prevState.player[player].score = prevState.player[player].score - 1)
      ]
    }));
  }

  render() {
    const { player } = this.state;
    return Render({
      player,
      addPoint: this.addPoint,
      subtractPoint: this.subtractPoint
    });
  }
}

export default MatchContainer;
