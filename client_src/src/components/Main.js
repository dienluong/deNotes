import React, { Fragment } from 'react';
import './Main.css';
import EditorContainer from './EditorContainer';
import NotesListContainer from './NotesListContainer';
import SplitPane from 'react-split-pane';

// TODO: remove
// import { BrowserRouter as Router, Route } from 'react-router-dom';
// import Delta from 'quill-delta';
// const initContent = new Delta();

class Main extends React.Component {
  render() {
    const editorOpts = { placeholder: 'Welcome to deNotes!' };

    return (
      <Fragment>
        <SplitPane split="vertical" defaultSize="30%" >
          <NotesListContainer />
          <EditorContainer options={ editorOpts }/>
        </SplitPane>
      </Fragment>
    );
  }
}

export default Main;
