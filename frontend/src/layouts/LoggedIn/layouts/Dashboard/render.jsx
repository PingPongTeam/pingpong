import React from 'react';
import { Link } from 'react-router-dom';
import glamorous from 'glamorous';
import globalStyles from 'globalStyles';
import Button from 'components/Button';

const Wrapper = glamorous.div({
  width: '100%'
});
const StartMatch = glamorous.div({
  position: 'fixed',
  bottom: 0,
  width: '100%'
});
const MatchList = glamorous.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
});
const Match = glamorous.span({
  display: 'inline-flex',
  alignItems: 'center'
});
const PlayerName = glamorous.span({
  fontSize: '10vw',
  padding: '0.2em'
});
const PlayerScore = glamorous.span({
  fontSize: '16vw',
  padding: '0.2em'
});
const winner = { color: `hsl(${globalStyles.colors.success})` };
const looser = { color: `hsl(${globalStyles.colors.danger})` };

const Dashboard = ({ matchList }) => {
  console.log(matchList);
  return (
    <Wrapper>
      <MatchList>
        {matchList.map((match, index) => {
          const playerOneColor =
            match.player1.score > match.player2.score ? winner : looser;
          const playerTwoColor =
            match.player2.score > match.player1.score ? winner : looser;
          return (
            <Match key={index}>
              <PlayerName style={playerOneColor}>
                {match.player1.alias}
              </PlayerName>
              <PlayerScore style={{ ...playerOneColor, textAlign: 'right' }}>
                {match.player1.score}
              </PlayerScore>
              <PlayerScore style={playerTwoColor}>
                {match.player2.score}
              </PlayerScore>
              <PlayerName style={playerTwoColor}>
                {match.player2.alias}
              </PlayerName>
            </Match>
          );
        })}
      </MatchList>
      <StartMatch>
        <Link to="/match/new">
          <Button>Start new game</Button>
        </Link>
      </StartMatch>
    </Wrapper>
  );
};

export default Dashboard;
