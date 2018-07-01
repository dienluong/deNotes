// TODO: Delete Note.js
// import Note from './Note';

import Tree, { removeNode, changeNodeAtPath, addNodeUnderParent } from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import './NotesList.css';
import React from 'react';
import uniqid from 'uniqid';

import sampleNotes from '../test/sample-tree';

const getNodeKey = ({ treeIndex }) => treeIndex;

class NotesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notesTree: sampleNotes,
      activeNote: null,
    };

    this.handleChange = this.handleChange.bind(this);
    this.buildNodeProps = this.buildNodeProps.bind(this);
  }

  handleChange(notesTree) {
    this.setState({
      notesTree,
    });
  }

  handleNodeClick(node) {
    console.log(`Active node: ${node.title} ${node.id}`);
    this.setState({
      activeNote: node.id,
    });
  }

  _buildNodeButtons({ node, path }) {
    let buttons = [
      <button
        style={{ verticalAlign: 'middle' }}
        onClick={ (event) => {
          event.stopPropagation();
          const activeNote = (node.id === this.state.activeNote) ? null : this.state.activeNote;
          const { treeData } = removeNode({
            treeData: this.state.notesTree,
            getNodeKey,
            path,
          });
          this.setState({
            notesTree: treeData,
            activeNote,
          });
        }}
      >
        x
      </button>,
    ];

    // Check if current node is parent node
    if (typeof node.children !== 'undefined') {
      buttons.unshift(
        <button
          style={{ verticalAlign: 'middle' }}
          onClick={ (event) => {
            event.stopPropagation();
            const { treeData } = addNodeUnderParent({
              treeData: this.state.notesTree,
              getNodeKey,
              parentKey: path[path.length - 1],
              newNode: {
                title: 'new note',
                subtitle: () => new Date().toLocaleString(),
                id: uniqid(),
              },
              expandParent: true,
            });
            this.setState({
              notesTree: treeData,
            });
          }}
        >
          +
        </button>);
    }

    return buttons;
  }

  buildNodeProps({ node, path }) {
    return ({
      title: (
        <input
          value={ node.title }
          onChange={ event => {
            const title = event.target.value;
            this.setState({
              notesTree: changeNodeAtPath({
                treeData: this.state.notesTree,
                path,
                newNode: { ...node, title },
                getNodeKey,
              }),
            });
          }}
        />
      ),
      className: (node.id === this.state.activeNote) ? 'active-tree-node' : '',
      buttons: this._buildNodeButtons({ node, path }),
      onClick: this.handleNodeClick.bind(this, node),
    });
  }

  render() {
    console.log(`Active note: ${this.state.activeNote}`);
    return (
      <Tree
        className='tree'
        treeData={ this.state.notesTree }
        onChange={ this.handleChange }
        generateNodeProps={ this.buildNodeProps }
      />
    );
  };
}

export default NotesList;
