// TODO: Delete Note.js
// import Note from './Note';
import minimalTheme from 'react-sortable-tree-theme-minimal';

import React, { Fragment } from 'react';
import Tree, {
  removeNode,
  changeNodeAtPath,
  addNodeUnderParent,
  find,
  insertNode } from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import Toolbar from './Toolbar';
import './NotesList.css';
import uniqid from 'uniqid';

import sampleNotes from '../test/sample-tree';

// const getNodeKey = ({ treeIndex }) => treeIndex;
const getNodeKey = ({ node }) => node.id;

class NotesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notesTree: sampleNotes,
      activeNode: {
        id: null,
        path: [],
      },
    };

    this.handleChange = this.handleChange.bind(this);
    this.buildNodeProps = this.buildNodeProps.bind(this);
    this.newFolder = this.newFolder.bind(this);
  }

  handleChange(notesTree) {
    this.setState({
      notesTree,
    });
  }

  handleNodeClick(node, path) {
    // TODO: remove
    console.log(`Active ID: ${node.id} // PATH: ${path}`);
    this.setState({
      activeNode: {
        id: node.id,
        path: path,
      },
    });
  }

  _createNode({
    title = 'New Note',
    subtitle = new Date().toLocaleString(),
    type = 'item',
  }) {
    const newNode = {
      title,
      subtitle,
      type,
      uniqid: uniqid(),
      get id() {
        return `${this.title}~^~${this.type}~^~${this.uniqid}`;
      },
    };

    if (type === 'folder') {
      newNode.children = [];
      newNode.title = 'New Folder';
    }

    return newNode;
  }

  _buildNodeButtons({ node, path }) {
    let buttons = [
      <button
        style={{ verticalAlign: 'middle' }}
        onClick={ (event) => {
          event.stopPropagation();
          let activeNode = this.state.activeNode;
          const { treeData } = removeNode({
            treeData: this.state.notesTree,
            getNodeKey,
            path,
          });

          // clear active note
          if (node.id === this.state.activeNode.id) {
            activeNode = {
              id: null,
              path: [],
            };
          }

          this.setState({
            notesTree: treeData,
            activeNode,
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
              newNode: this._createNode({}),
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
      className: (node.id === this.state.activeNode.id) ? 'active-tree-node' : '',
      buttons: this._buildNodeButtons({ node, path }),
      onClick: this.handleNodeClick.bind(this, node, path),
    });
  }

  newFolder() {
    const { matches } = find({
      getNodeKey,
      treeData: this.state.notesTree,
      searchQuery: this.state.activeNode.id,
      searchMethod: ({ node, searchQuery }) => node.id === searchQuery,
    });

    // TODO: TO BE CONTINUED...
    if (Array.isArray(matches) && matches.length) {
      // If the current active (i.e. selected) node is not a folder and it has no parent
      if ((typeof matches[0].children === 'undefined') && (matches[0].path.length === 1)) {
        const newNode = this._createNode({
          type: 'folder',
        });
        // treeIndex + 1 to insert after the active node.
        this.setState({
          notesTree: insertNode({
            treeData: this.state.notesTree,
            depth: 0,
            minimumTreeIndex: matches[0].treeIndex + 1,
            newNode,
            getNodeKey,
            expandParent: true,
          }).treeData,
          activeNode: {
            id: newNode.id,
            path: [],
          },
        });
      }
    }
  }

  render() {
    // TODO: remove
    console.log(`Active ID: ${this.state.activeNode.id}`);
    return (
      <Fragment>
        <Toolbar newFolderBtnClickHandler={ this.newFolder } newNoteBtnClickHandler={ this.newFolder } />
        <Tree
          className='tree'
          treeData={ this.state.notesTree }
          onChange={ this.handleChange }
          getNodeKey={ getNodeKey }
          generateNodeProps={ this.buildNodeProps }
        />
      </Fragment>
    );
  }
}

export default NotesList;

