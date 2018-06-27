/* TODO: Revisit this component and react-ui-tree code to see if rendering can be optimized
   https://reactjs.org/docs/optimizing-performance.html
*/
// import 'react-ui-tree/dist/react-ui-tree.css';
// import Tree from 'react-ui-tree';
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
    // this.renderNode = this.renderNode.bind(this);
    // this.onClickNode = this.onClickNode.bind(this);
    this.deleteNote = this.deleteNote.bind(this);
  }

  handleChange(notesTree) {
    this.setState({
      notesTree,
    });
  }

  /* TODO: Remove, formerly for react-ui-tree
  renderNode(node) {
    // console.log(`renderNode ${node.module}`);
    return (
      <Note
        active={ this.state.activeNote === node }
        clickHandler={ this.onClickNode }
        node={ node }
      />
    );
  }

  onClickNode(node) {
    // console.log(`Active Note: ${node.module}`);
    this.setState({
      activeNote: node,
    });
  }
  */

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
