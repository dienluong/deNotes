// TODO: Delete Note.js
// import Note from './Note';
import minimalTheme from 'react-sortable-tree-theme-minimal';

import React, { Fragment } from 'react';
import Tree, {
  removeNode,
  changeNodeAtPath,
  addNodeUnderParent,
} from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import Toolbar from './Toolbar';
import './NotesList.css';
import uniqid from 'uniqid';

import sampleNotes from '../test/sample-tree';

// const getNodeKey = ({ treeIndex }) => treeIndex;
const getNodeKey = ({ node }) => node.id;
const _idDelimiter = '~^~';

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
        path: path || [],
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
        return `${this.title}${_idDelimiter}${this.type}${_idDelimiter}${this.uniqid}`;
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

          // if deleted node is part of the active path, re-adjust the active node
          const deletedNodeIdx = this.state.activeNode.path.lastIndexOf(node.id);
          if (deletedNodeIdx >= 0) {
            const newActivePath = this.state.activeNode.path.slice(0, deletedNodeIdx);
            if (!newActivePath.length) {
              activeNode = {
                id: null,
                path: [],
              };
            } else {
              activeNode = {
                id: newActivePath[newActivePath.length - 1],
                path: newActivePath,
              };
            }
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
            const newNode = this._createNode({});
            const { treeData } = addNodeUnderParent({
              treeData: this.state.notesTree,
              getNodeKey,
              parentKey: path[path.length - 1],
              newNode,
              expandParent: true,
            });
            this.setState({
              notesTree: treeData,
              activeNode: {
                id: newNode.id,
                path: [...(path || []), newNode.id],
              },
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

  /**
   * Returns the index of the deepest node of type 'folder' in path.
   * Returns null if none found.
   * @param path
   * @return {*}
   * @private
   */
  static _findFarthestParent(path) {
    if (!Array.isArray(path) || (path.length === 0)) {
      return null;
    }

    const lastStep = path[path.length - 1];
    if (path.length === 1) {
      return (lastStep.includes(`${_idDelimiter}folder${_idDelimiter}`) ? 0 : null);
    } else {
      // If last step in path is not a folder, then the step previous to last must be a folder.
      return (lastStep.includes(`${_idDelimiter}folder${_idDelimiter}`)) ? path.length - 1 : path.length - 2;
    }
  }

  newFolder() {
    // TODO: TO BE CONTINUED...
    const newNode = this._createNode({ type: 'folder' });
    const workingPath = this.state.activeNode.path;
    const parentIdx = NotesList._findFarthestParent(workingPath);
    let activeNodePath = [];
    let parentKey = null;

    // if parent found
    if (parentIdx !== null) {
      parentKey = workingPath[parentIdx];
      activeNodePath = [...workingPath.slice(0, parentIdx + 1), newNode.id];
    } else {
      parentKey = null;
      activeNodePath = [newNode.id];
    }

    this.setState({
      notesTree: addNodeUnderParent({
        treeData: this.state.notesTree,
        newNode,
        parentKey,
        getNodeKey,
        expandParent: true,
      }).treeData,
      activeNode: {
        id: newNode.id,
        path: activeNodePath,
      },
    });
  }

  render() {
    // TODO: remove
    console.log(`Active ID: ${this.state.activeNode.id}  //  Active Path: ${this.state.activeNode.path}`);
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

