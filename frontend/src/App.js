import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Route, Redirect, Switch } from 'react-router-dom';
import state from 'services/state';
import glamorous from 'glamorous';
import LoggedIn from 'layouts/LoggedIn';
import LoggedOut from 'layouts/LoggedOut';

const Wrapper = glamorous.div({
  height: '100%'
});

class App extends Component {
  render() {
    return (
      <Wrapper>
        { !state.connectedToServer && navigator.onLine && (<h1>AAAAAHHH THE SERVER IS DOWN!!!</h1>)}
        { !navigator.onLine && (<h1>NO INTERNET</h1>)}
        { !state.initInProcess && (
            <Switch>
              <Route path="/signup" exact component={LoggedOut} />
              <Route path="/login" exact component={LoggedOut} />
              <Route path='/' component={LoggedIn} />
              <Redirect to='/' />
            </Switch>
          )
        }
      </Wrapper>
    );
  }
}

export default observer(App);
