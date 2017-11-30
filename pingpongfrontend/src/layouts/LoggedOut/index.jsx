import React from 'react';
import glamorous from 'glamorous';
import Signup from './layouts/Signup';

const Wrapper = glamorous.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%'
})

const LoggedOut = () => {
  return (
    <Wrapper>
      <Signup />
    </Wrapper>
  );
};

export default LoggedOut;