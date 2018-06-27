// TODO: Delete Note.js
// import Note from './Note';

import Tree, { removeNode } from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
// TODO: Delete NotesList.css
// import './NotesList.css';
import React from 'react';

import sampleNotes from '../test/sample-tree';

class NotesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notesTree: sampleNotes,
    };

    this.handleChange = this.handleChange.bind(this);
    this.deleteNote = this.deleteNote.bind(this);
  }

  handleChange(notesTree) {
    this.setState({
      notesTree,
    });
  }

  deleteNote({ path }) {
    return ({
      buttons: [
        <button
          style={{ verticalAlign: 'middle' }}
          onClick={() => {
            const { treeData } = removeNode({
              treeData: this.state.notesTree,
              getNodeKey: ({ treeIndex }) => treeIndex,
              path,
            });
            this.setState({
              notesTree: treeData,
            });
          }}
        >
          x
        </button>,
      ],
    });
  }

  render() {
    console.log('rendering NoteLists........................');
    return (
      <Tree
        className='tree'
        treeData={ this.state.notesTree }
        onChange={ this.handleChange }
        generateNodeProps={ this.deleteNote }
      />
    );
  };
}

export default NotesList;
