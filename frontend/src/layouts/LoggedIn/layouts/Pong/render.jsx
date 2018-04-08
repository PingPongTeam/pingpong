import React from 'react';
import { Link } from 'react-router-dom';
import glamorous from 'glamorous';
import SearchInput from 'components/SearchInput';
import Button from 'components/Button';
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
      <h1>PONG</h1>
      <canvas ref="playfield" />
      <BottomControlWrapper>
        <Link to="/">
          <SecondaryButton>Cancel</SecondaryButton>
        </Link>
      </BottomControlWrapper>
    </Wrapper>
  );
};

export default PongRender;
