import React from 'react';
import { Link } from 'react-router-dom';
import glamorous from 'glamorous';
import SecondaryButton from 'components/SecondaryButton';

const Wrapper = glamorous.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '100%'
});

const BottomControlWrapper = glamorous.div({
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  bottom: 0,
  width: '100%'
});

const PongRender = ({ game }) => {
  return (
    <Wrapper onKeyDown={game.keyDown}>
      <h1>
        {game.game.scoreTable[0].name} vs {game.game.scoreTable[1].name}
      </h1>
      <canvas ref="playfield" />
      <h3>
        {game.game.scoreTable[0].gameScore} |{' '}
        {game.game.scoreTable[1].gameScore}
      </h3>
      <BottomControlWrapper>
        <Link to="/">
          <SecondaryButton>Cancel</SecondaryButton>
        </Link>
      </BottomControlWrapper>
    </Wrapper>
  );
};

export default PongRender;
