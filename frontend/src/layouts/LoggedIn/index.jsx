import React from 'react';
import glamorous from 'glamorous';
import { Route, Redirect, Switch } from 'react-router-dom';
import { observer } from 'mobx-react';
import state from 'services/state';
import Dashboard from './layouts/Dashboard';
import NewMatch from './layouts/NewMatch';
import Match from './layouts/Match';

const Wrapper = glamorous.div({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  minHeight: '100%'
});

const LoggedIn = () => {
  return (
    <Wrapper>
      <Switch>
        {!state.loggedIn && <Redirect to="/login" />}
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/match/new" component={NewMatch} />
        <Route path="/match/ongoing" component={Match} />
        <Redirect from="/" exact to="/dashboard" />
        <Redirect to="/404" />
      </Switch>
    </Wrapper>
  );
};

export default observer(LoggedIn);
