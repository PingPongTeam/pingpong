import React from 'react';
import glamorous from 'glamorous';

const Wrapper = glamorous.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%'
})

const NoMatch = () => (
  <Wrapper>
    <div>
      <p>404</p>
      <h1>NO PING PONG HERE!</h1>
      <h2>GO AWAY</h2>
    </div>
  </Wrapper>
);

export default NoMatch;
