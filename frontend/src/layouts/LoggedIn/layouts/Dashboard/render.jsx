import React from 'react';
import { Link } from 'react-router-dom';
import globalStyles from 'globalStyles';
import Button from 'components/Button';
import {
  Wrapper,
  Menu,
  TotalScore,
  TotalScoreNumber,
  TotalScoreBox,
  MatchListLabel,
  MatchList,
  Match,
  PlayerBox,
  PlayerName,
  PlayerScore,
  StartMatch
} from './styles';

const winner = { color: `hsl(${globalStyles.colors.success})` };
const looser = { color: `hsl(${globalStyles.colors.danger})` };

const Dashboard = ({ handleLogout, userId, matches }) => {
  return (
    <Wrapper>
      <Menu onClick={handleLogout}>Log out</Menu>
      <TotalScore>
        <TotalScoreBox>
          <div>wins</div>
          <TotalScoreNumber>{matches.total.wins}</TotalScoreNumber>
        </TotalScoreBox>
        <TotalScoreBox>
          <div>losses</div>
          <TotalScoreNumber>{matches.total.losses}</TotalScoreNumber>
        </TotalScoreBox>
      </TotalScore>
      <MatchListLabel>Recent matches</MatchListLabel>
      <MatchList>
        {matches.history.map((match, index) => {
          const playerOne = match.player.find(player => {
            return player.id == userId;
          });
          console.log(playerOne);
          const playerTwo = match.player.find(player => {
            return player.id != userId;
          });
          const winOrLoss = playerOne.score > playerTwo.score ? winner : looser;
          return (
            <Match key={index}>
              <PlayerBox style={{ justifyContent: 'flex-end' }}>
                <PlayerName>You</PlayerName>
                <PlayerScore style={{ ...winOrLoss }}>
                  {playerOne.score}
                </PlayerScore>
              </PlayerBox>
              <PlayerBox>
                <PlayerScore style={{ ...winOrLoss }}>
                  {playerTwo.score}
                </PlayerScore>
                <PlayerName>{playerTwo.alias}</PlayerName>
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
