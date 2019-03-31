// TODO: remove App.css
import './App.css';
import CssBaseline from '@material-ui/core/CssBaseline';
import React, { Component } from 'react';
import Main from './components/Main';

class App extends Component {
  render() {
    return (
      <React.Fragment>
        <CssBaseline />
        <Main className="App" />
      </React.Fragment>
    );
  }
}

export default App;
