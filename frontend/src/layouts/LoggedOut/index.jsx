import React from 'react';
import { observer } from 'mobx-react';
import { Route, Redirect, Switch } from 'react-router-dom';
import glamorous from 'glamorous';
import state from 'services/state';
import Login from './layouts/Login';
import Signup from './layouts/Signup';

const Wrapper = glamorous.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: '100%',
  padding: '10% 1%'
});

const LoggedOut = () => {
  return (
    <Wrapper>
      <Switch>
        {state.loggedIn && <Redirect to="/dashboard" />}
        <Route path="/login" component={Login} />
        <Route path="/signup" exact component={Signup} />
        <Redirect to="/404" />
      </Switch>
    </Wrapper>
  );
};

export default observer(LoggedOut);
