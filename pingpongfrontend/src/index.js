import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import 'normalize.css';
import 'baseStyles.css';
import NoMatch from 'layouts/NoMatch';
import state from 'services/state';



import { autorun } from 'mobx';

autorun(() => {
  console.log('are we connected?: ', state.connectedToServer);
  console.log('SETTING UP THIS THING: ', state.initInProcess);
  console.log('are we logged in?: ', state.loggedIn);
});

const Root = () => (
  <BrowserRouter>
    <Switch>
      <Route path='/404' exact component={NoMatch} />
      <Route path='/' component={App} />
    </Switch>
  </BrowserRouter>
);

ReactDOM.render(<Root />, document.getElementById('root'));
registerServiceWorker();
