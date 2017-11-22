import React, { Component } from 'react';
import LoggedOut from 'layouts/LoggedOut';
import glamorous from 'glamorous';

const Wrapper = glamorous.div({
  height: '100%'
});

class App extends Component {
  render() {
    return (
      <Wrapper>
        <LoggedOut />
      </Wrapper>
    );
  }
}

export default App;
