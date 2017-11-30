import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { socket } from 'services/api';
import 'normalize.css';
import 'baseStyles.css';
import NoMatch from 'layouts/NoMatch';

socket.on('connect', () => {
  console.log('CONNECTED!!!W WOOOOO');
  socket.emit('Huddik suger', 'true');
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
