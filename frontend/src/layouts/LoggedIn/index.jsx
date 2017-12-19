import React from 'react';
import glamorous from 'glamorous';
import { Route, Redirect, Switch } from 'react-router-dom';
import { observer } from 'mobx-react';
import state from 'services/state';
import Dashboard from './layouts/Dashboard';

const Wrapper = glamorous.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%'
})

const LoggedIn = () => {
  return (
    <Wrapper>
      <Switch>
        {!state.loggedIn && (<Redirect to='/login' />)}
        <Route path='/dashboard' component={Dashboard} />
        <Redirect from='/' exact to='/dashboard'/>
        <Redirect to='/404' />
      </Switch>
    </Wrapper>
    
  );
};

export default observer(LoggedIn);