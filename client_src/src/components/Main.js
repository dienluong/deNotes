import React from 'react';
// import { BrowserRouter as Router, Route } from 'react-router-dom';
import Editor from './Editor';
import NotesList from 'NotesList';

class Main extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Editor />
    );
  }
}

export default Main;
