import React, { Fragment } from 'react';
import './Main.css';
import EditorContainer from './EditorContainer';
import NotesListContainer from './NotesListContainer';
import SplitPane from 'react-split-pane';

// TODO: remove
// import { BrowserRouter as Router, Route } from 'react-router-dom';
// import Delta from 'quill-delta';
// const initContent = new Delta();

const editorParams = {
  options: { placeholder: 'Welcome to deNotes! v0.02' },
};

class Main extends React.Component {
  render() {
    return (
      // <React.StrictMode>
      <Fragment>
        <SplitPane split="vertical" defaultSize="60%" >
          <NotesListContainer />
          <EditorContainer options={ editorParams.options }/>
        </SplitPane>
      </Fragment>
      // </React.StrictMode>
    );
  }
}

export default Main;
