import React from 'react';
import glamorous from 'glamorous';
import Button from 'components/Button';

const Wrapper = glamorous.div({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  justifyContent: 'space-between',
  userSelect: 'none'
});

const Players = glamorous.div({
  display: 'flex',
  flexGrow: 1,
  alignItems: 'center'
});
const Player = glamorous.div({
  flexGrow: 1,
  flexBasis: '50%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  overflow: 'hidden'
});
const PlayerName = glamorous.div({
  fontSize: '40px',
  maxWidth: '90%',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
});
const PlayerScore = glamorous.div({
  fontSize: 140,
  lineHeight: 0.8,
  marginBottom: '10px',
  width: '100%',
  textAlign: 'center'
});
const PointChanger = glamorous.div({
  fontSize: 30,
  opacity: 0.7,
  width: '100%',
  textAlign: 'center'
});

const MatchRender = ({
  player,
  addPoint,
  subtractPoint,
  submitMatch,
  submittingMatch
}) => {
  console.log('submitting match?:', submittingMatch);
  return (
    <Wrapper>
      <Players>
        <Player>
          <PlayerName
            onClick={() => {
              addPoint(0);
            }}
          >
            {player[0].alias}
          </PlayerName>
          <PointChanger
            onClick={() => {
              addPoint(0);
            }}
          >
            +
          </PointChanger>
          <PlayerScore
            onClick={() => {
              addPoint(0);
            }}
          >
            {player[0].score}
          </PlayerScore>
          <PointChanger
            onClick={() => {
              subtractPoint(0);
            }}
          >
            -
          </PointChanger>
        </Player>
        <Player>
          <PlayerName
            onClick={() => {
              addPoint(1);
            }}
          >
            {player[1].alias}
          </PlayerName>
          <PointChanger
            onClick={() => {
              addPoint(1);
            }}
          >
            +
          </PointChanger>
          <PlayerScore
            onClick={() => {
              addPoint(1);
            }}
          >
            {player[1].score}
          </PlayerScore>
          <PointChanger
            onClick={() => {
              subtractPoint(1);
            }}
          >
            -
          </PointChanger>
        </Player>
      </Players>
      <Button onClick={submitMatch} loading={submittingMatch}>
        End Match
      </Button>
    </Wrapper>
  );
};

export default MatchRender;
