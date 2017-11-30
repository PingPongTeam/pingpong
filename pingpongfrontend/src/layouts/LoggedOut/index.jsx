import React from 'react';
import glamorous from 'glamorous';
import { Route, Redirect, Switch } from 'react-router-dom';
import Login from './layouts/Login';
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
      <Switch>
        <Route path='/' exact component={Login} />
        <Route path='/signup' exact component={Signup} />
        <Redirect to='/404' />
      </Switch>
    </Wrapper>
  );
};

export default LoggedOut;