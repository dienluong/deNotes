// import { BrowserRouter as Router, Route } from 'react-router-dom';
import React, { Fragment } from 'react';
import './Main.css';
import Editor from './Editor';
import NotesListContainer from './NotesListContainer';
import SplitPane from 'react-split-pane';
import Delta from 'quill-delta';

const initContent = new Delta();

class Main extends React.Component {
  render() {
    const editorOpts = { placeholder: 'Start typing' };

    return (
      <Fragment>
        <SplitPane split="vertical" defaultSize="30%" >
          <NotesListContainer />
          <Editor options={ editorOpts } initialContent={ initContent }/>
        </SplitPane>
      </Fragment>
    );
  }
}

export default Main;
