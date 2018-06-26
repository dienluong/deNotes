// import { BrowserRouter as Router, Route } from 'react-router-dom';
import React, { Fragment } from 'react';
import './Main.css';
import Editor from './Editor';
import NotesList from './NotesList';
import SplitPane from 'react-split-pane';

class Main extends React.Component {
  render() {
    return (
      <Fragment>
        <SplitPane split="vertical" defaultSize="30%" >
          <NotesList />
          <Editor />
        </SplitPane>
      </Fragment>
    );
  }
}

export default Main;
