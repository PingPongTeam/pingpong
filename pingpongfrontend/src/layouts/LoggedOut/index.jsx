import React from 'react';
import glamorous from 'glamorous';
import Login from './layouts/Login/';

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
      <Login />
    </Wrapper>
  );
};

export default LoggedOut;