import React, { Fragment } from 'react';
import Toolbar from './Toolbar';
import PathNavigator from './PathNavigator';
import Tree, {
  addNodeUnderParent,
  changeNodeAtPath,
  removeNode } from 'react-sortable-tree';

import 'react-sortable-tree/style.css';
import uniqid from 'uniqid';
import './NotesListWidget.css';

// TODO: Define these in a env config file.
const ID_DELIMITER = '|^|';
const getNodeKey = ({ node }) => node.id;

class NotesListWidget extends React.Component {
  constructor(props) {
    super(props);
    this.buildNodeProps = this.buildNodeProps.bind(this);
    this.newFolder = this.newFolder.bind(this);
  }

  /**
   * Extracts the specified kind of info from the path and returns it in an array.
   * @param path
   * @param kind
   * @return {*}
   * @private
   */
  static _extractInfoFromPath({ path = [], kind = 'title' }) {
    if (!Array.isArray(path) || !path.length) {
      return [];
    }

    switch (kind) {
      case 'title':
        return path.map((step) => String(step).split(ID_DELIMITER)[0]);
      case 'type':
        return path.map((step) => String(step).split(ID_DELIMITER)[1]);
      case 'uniqid':
        return path.map((step) => String(step).split(ID_DELIMITER)[2]);
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
        return `${this.title}${ID_DELIMITER}${this.type}${ID_DELIMITER}${this.uniqid}`;
      },
    };

    if (type === 'folder') {
      newNode.children = [];
      newNode.title = 'New Folder';
    }

    return newNode;
  }

  buildNodeProps({ node, path }) {
    return ({
      title: (
        <form
          onSubmit={ event => {
            event.preventDefault();
            const title = event.target.value;
            // TODO: TO BE CONTINUED 7/15
            // 1) submit on eventBlur
            // 2) To solve: retrieve the correct title
            console.log(`>>>>> Submitted title: ${ title }`);
            // this.setState({
            //   notesTree: changeNodeAtPath({
            //     treeData: this.state.notesTree,
            //     path,
            //     newNode: { ...node, title },
            //     getNodeKey,
            //   }),
            // });

            const changedTree = changeNodeAtPath({
              treeData: this.props.notesTree,
              path,
              // newNode: { ...node, title },
              newNode: NotesListWidget._createNode({ title, type: node.type }),
              getNodeKey,
            });

            console.log('-->Tree changed on node title change\n');
            this.props.nodeChangeHandler(changedTree);
          }}
        >
          <input
            type="text"
            defaultValue={ node.title }
          />
        </form>
      ),
      className: (node.id === this.props.activeNode.id) ? 'active-tree-node' : '',
      buttons: this._buildNodeButtons({ node, path }),
      onClick: () => this.props.nodeClickHandler({ node, path }),
    });
  }

  _buildNodeButtons({ node, path }) {
    let buttons = [
      <button
        style={{ verticalAlign: 'middle' }}
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
          style={{ verticalAlign: 'middle' }}
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
      return (lastStep.includes(`${ID_DELIMITER}folder${ID_DELIMITER}`) ? 0 : null);
    } else {
      // If last step in path is not a folder, then the step previous to last must be a folder.
      return (lastStep.includes(`${ID_DELIMITER}folder${ID_DELIMITER}`)) ? path.length - 1 : path.length - 2;
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
    console.log(`Active ID: ${this.props.activeNode.id}  //  Path: ${NotesListWidget._extractInfoFromPath({
      path: this.props.activeNode.path,
      kind: 'title',
    }) }`);

    return (
      <Fragment>
        <Toolbar newFolderBtnClickHandler={ this.newFolder } newNoteBtnClickHandler={ this.newFolder }/>
        <PathNavigator path={
          NotesListWidget._extractInfoFromPath({
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
