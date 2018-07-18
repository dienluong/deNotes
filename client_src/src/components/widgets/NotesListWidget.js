import React, { Fragment } from 'react';
import Toolbar from './Toolbar';
import PathNavigator from './PathNavigator';
import Tree, {
  addNodeUnderParent,
  changeNodeAtPath,
  removeNode,
  find } from 'react-sortable-tree';

import 'react-sortable-tree/style.css';
import uniqid from 'uniqid';
import './NotesListWidget.css';
import NoteTitle from './NoteTitle';

// TODO: Define these in a env config file.
const ID_DELIMITER = '|^|';
const getNodeKey = ({ node }) => node.id;

class NotesListWidget extends React.Component {
  constructor(props) {
    super(props);
    this.buildNodeProps = this.buildNodeProps.bind(this);
    this.newFolder = this.newFolder.bind(this);
    this.noteTitleSubmitHandler = this.noteTitleSubmitHandler.bind(this);
    this._extractInfoFromPath = this._extractInfoFromPath.bind(this);
  }

  /**
   * Extracts the specified kind of info from each entry in the path and returns it in an array.
   * @param path {Array}
   * @param kind {string}
   * @return {Array}
   * @private
   */
  _extractInfoFromPath({ path = [], kind = 'type' }) {
    let info = [];
    if (!Array.isArray(path) || !path.length) {
      return info;
    }

    switch (kind) {
      case 'title':
      //   return path.map((step) => String(step).split(ID_DELIMITER)[0]);
        return path.map((id) => {
          const matches = find({
            getNodeKey,
            treeData: this.props.notesTree,
            searchQuery: id,
            searchMethod: ({ node, searchQuery }) => searchQuery === node.id,
          }).matches;
          return matches.length ? matches[0].node.title : '';
        });
      case 'type':
        info = path.map((step) => String(step).split(ID_DELIMITER));
        return info[0] ? [info[0]] : [];
      case 'uniqid':
        info = path.map((step) => String(step).split(ID_DELIMITER));
        return info[1] ? [info[1]] : [];
      default:
        return [];
    }
  }

  static _createNode({
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
        return `${this.type}${ID_DELIMITER}${this.uniqid}`;
      },
    };

    if (type === 'folder') {
      newNode.children = [];
      newNode.title = title === 'New Note' ? 'New Folder' : title;
    }

    return newNode;
  }

  noteTitleSubmitHandler({ title, node, path }) {
    console.log(`>>>>> Submitted title: ${ title } ; node.type: ${ node.type } ;`);
    // this.setState({
    //   notesTree: changeNodeAtPath({
    //     treeData: this.state.notesTree,
    //     path,
    //     newNode: { ...node, title },
    //     getNodeKey,
    //   }),
    // });

    // TODO: Must use a map structure to map the ID to the corresponding node title
    // Cannot use _createNode for creating a new node (with a new ID) as it is breaking the tree.
    // This is because react-sortable-tree treats it as a new standalone node due to new ID (not reusing the ID of the old node)
    // So using { ...node, title } to keep the ID intact and only change the title
    const modifiedNode = { ...node, title };
    const changedTree = changeNodeAtPath({
      treeData: this.props.notesTree,
      path,
      newNode: modifiedNode,
      getNodeKey,
    });

    // Find the newNode now part of the tree, which gives us the its path and children, if any.
    const matches = find({
      getNodeKey,
      treeData: changedTree,
      searchQuery: modifiedNode.id,
      searchMethod: ({ node, searchQuery }) => searchQuery === node.id,
    }).matches;

    let newActiveNode = null;
    if (matches.length) {
      newActiveNode = {
        id: matches[0].node.id,
        path: matches[0].path,
      };
    }
    console.log('-->Tree changed on node title change\n');
    this.props.nodeChangeHandler({ notesTree: changedTree, activeNode: newActiveNode });
  }

  buildNodeProps({ node, path }) {
    return ({
      title: (
        <NoteTitle node={ node } path={ path } submitHandler={ this.noteTitleSubmitHandler } />
      ),
      className: (node.id === this.props.activeNode.id) ? 'active-tree-node' : '',
      buttons: this._buildNodeButtons({ node, path }),
      onClick: () => this.props.nodeClickHandler({ id: node.id, path }),
    });
  }

  _buildNodeButtons({ node, path }) {
    let buttons = [
      <button
        className='tree-node-btn'
        onClick={ (event) => {
          event.stopPropagation();
          const { treeData } = removeNode({
            treeData: this.props.notesTree,
            getNodeKey,
            path,
          });

          let activeNode = null;
          // if deleted node is part of the active path, re-adjust the active node
          const deletedNodeIdx = this.props.activeNode.path.lastIndexOf(node.id);
          if (deletedNodeIdx >= 0) {
            const newActivePath = this.props.activeNode.path.slice(0, deletedNodeIdx);
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

          // this.setState({
          //   notesTree: treeData,
          //   activeNode,
          // });

          this.props.deleteNodeBtnHandler({ notesTree: treeData, activeNode });
        }}
      >
        x
      </button>,
    ];

    // Check if current node is parent node; '+' button only for parent nodes
    if (typeof node.children !== 'undefined') {
      buttons.unshift(
        <button
          className='tree-node-btn'
          onClick={ (event) => {
            event.stopPropagation();
            const newNode = NotesListWidget._createNode({});
            const { treeData } = addNodeUnderParent({
              treeData: this.props.notesTree,
              getNodeKey,
              parentKey: path[path.length - 1],
              newNode,
              expandParent: true,
            });

            const activeNode = {
              id: newNode.id,
              path: [...(path || []), newNode.id],
            };
            // this.setState({
            //   notesTree: treeData,
            //   activeNode: {
            //     id: newNode.id,
            //     path: [...(path || []), newNode.id],
            //   },
            // });
            this.props.addNodeBtnHandler({ notesTree: treeData, activeNode });
          }}
        >
          +
        </button>);
    }

    return buttons;
  }




  /**
   * Returns the index of the deepest node of type 'folder' in path.
   * Returns null if none found.
   * @param path {Array}
   * @return {?number}
   * @private
   */
  static _findFarthestParent(path) {
    if (!Array.isArray(path) || (path.length === 0)) {
      return null;
    }

    const lastStep = path[path.length - 1];
    if (path.length === 1) {
      return (lastStep.includes(`folder${ID_DELIMITER}`) ? 0 : null);
    } else {
      // If last step in path is not a folder, then the step previous to last must be a folder.
      return (lastStep.includes(`folder${ID_DELIMITER}`)) ? path.length - 1 : path.length - 2;
    }
  }

  newFolder() {
    let activeNodePath = [];
    let parentKey = null;
    const newNode = NotesListWidget._createNode({ type: 'folder' });
    const workingPath = this.props.activeNode.path;
    const parentIdx = NotesListWidget._findFarthestParent(workingPath);

    // if parent found
    if (parentIdx !== null) {
      parentKey = workingPath[parentIdx];
      activeNodePath = [...workingPath.slice(0, parentIdx + 1), newNode.id];
    } else {
      parentKey = null;
      activeNodePath = [newNode.id];
    }

    const notesTree = addNodeUnderParent({
      treeData: this.props.notesTree,
      newNode,
      parentKey,
      getNodeKey,
      expandParent: true,
    }).treeData;

    const activeNode = {
      id: newNode.id,
      path: activeNodePath,
    };

    // this.setState({
    //   notesTree: addNodeUnderParent({
    //     treeData: this.state.notesTree,
    //     newNode,
    //     parentKey,
    //     getNodeKey,
    //     expandParent: true,
    //   }).treeData,
    //   activeNode: {
    //     id: newNode.id,
    //     path: activeNodePath,
    //   },
    // });
    this.props.toolbarNewFolderBtnClickHandler({ notesTree, activeNode });
  }




  render() {
    // TODO: remove
    console.log(`
    Active ID: ${this.props.activeNode.id} \n
    Path: ${this.props.activeNode.path} \n
    ${this._extractInfoFromPath({ path: this.props.activeNode.path, kind: 'title' }) }
    `);

    return (
      <Fragment>
        <Toolbar newFolderBtnClickHandler={ this.newFolder } newNoteBtnClickHandler={ this.newFolder }/>
        <PathNavigator path={
          this._extractInfoFromPath({
            path: this.props.activeNode.path,
            kind: 'title',
          })
        }/>
        <Tree
          className='tree'
          treeData={ this.props.notesTree }
          onChange={ this.props.treeChangeHandler }
          getNodeKey={ getNodeKey }
          generateNodeProps={ this.buildNodeProps }
        />
      </Fragment>
    );
  }
}

export default NotesListWidget;
