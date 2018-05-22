import React from 'react';
import { Link } from 'react-router-dom';
import glamorous from 'glamorous';
import globalStyles from 'globalStyles';
import Button from 'components/Button';

const Wrapper = glamorous.div({
  width: '100%'
});
const Menu = glamorous.div({
  position: 'fixed',
  top: 0,
  left: 0,
  padding: '1em'
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
  display: 'flex',
  width: '100%'
});
const PlayerBox = glamorous.div({
  flexBasis: '50%',
  flexGrow: 0,
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center'
});
const PlayerName = glamorous.span({
  fontSize: '10vw',
  fontWeight: 300
});
const PlayerScore = glamorous.span({
  fontSize: '15vw',
  padding: '0.15em 0 0.15em',
  flexBasis: '23vw',
  textAlign: 'center'
});
const winner = { color: `hsl(${globalStyles.colors.success})` };
const looser = { color: `hsl(${globalStyles.colors.danger})` };

const Dashboard = ({ matchList, handleLogout }) => {
  console.log(matchList);
  return (
    <Wrapper>
      <Menu onClick={handleLogout}>Menu</Menu>
      <MatchList>
        {matchList.map((match, index) => {
          const playerOneColor =
            match.player1.score > match.player2.score ? winner : looser;
          const playerTwoColor =
            match.player2.score > match.player1.score ? winner : looser;
          return (
            <Match key={index}>
              <PlayerBox style={{ justifyContent: 'flex-end' }}>
                <PlayerName>{match.player1.alias}</PlayerName>
                <PlayerScore style={{ ...playerOneColor }}>
                  {match.player1.score}
                </PlayerScore>
              </PlayerBox>
              <PlayerBox>
                <PlayerScore style={playerTwoColor}>
                  {match.player2.score}
                </PlayerScore>
                <PlayerName>{match.player2.alias}</PlayerName>
              </PlayerBox>
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
