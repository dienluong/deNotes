import React, { Fragment } from 'react';
import Toolbar from './Toolbar';
import Tool from './Tool';
import PathNavigator from './PathNavigator';
import Tree, {
  addNodeUnderParent,
  find } from 'react-sortable-tree';
import { getNodeKey } from '../../utils/tree-utils';

import 'react-sortable-tree/style.css';
import uniqid from 'uniqid';
import './NotesList.css';
import NodeTitle from './NodeTitle';

// TODO: Define these in a env config file.
const ID_DELIMITER = '|^|';

function NotesList({
  notesTree,
  activeNode,
  treeChangeHandler,
  nodeTitleChangeHandler,
  nodeClickHandler,
  deleteNodeBtnHandler,
  addNodeBtnHandler,
  toolbarNewFolderBtnClickHandler,
  toolbarNewNoteBtnClickHandler,
  pathNavigatorClickHandler,
}) {
  /**
   * For each entry in path, return the specified kind of info
   * @param path {Array}
   * @param kind {string}
   * @return {Array}
   * @private
   */
  function _translatePathtoInfo({ path = [], kind = 'type' }) {
    let info = [];
    if (!Array.isArray(path) || !path.length) {
      return info;
    }

    switch (kind) {
      case 'title':
        return path.map((id) => {
          const matches = find({
            getNodeKey,
            treeData: notesTree,
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

  function _createNode({
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

  function buildNodeProps({ node, path }) {
    return ({
      title: (
        <NodeTitle node={ node } path={ path } onSubmit={ nodeTitleChangeHandler } />
      ),
      className: (node.id === activeNode.id) ? 'active-tree-node' : '',
      buttons: _buildNodeButtons({ node, path }),
      onClick: () => nodeClickHandler({ id: node.id, path }),
    });
  }

  function _buildNodeButtons({ node, path }) {
    let buttons = [
      <button
        className='tree-node-btn'
        onClick={ (event) => {
          event.stopPropagation();
          deleteNodeBtnHandler({ node, path });
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
            addNodeBtnHandler({ path });
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
  function _findFarthestParent(path) {
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

  function newFolder() {
    let newActiveNodePath = [];
    let parentKey = null;
    const newNode = _createNode({ type: 'folder' });
    const currentActivePath = activeNode.path;
    const parentIdx = _findFarthestParent(currentActivePath);

    // if parent found
    if (parentIdx !== null) {
      parentKey = currentActivePath[parentIdx];
      newActiveNodePath = [...currentActivePath.slice(0, parentIdx + 1), newNode.id];
    } else {
      parentKey = null;
      newActiveNodePath = [newNode.id];
    }

    const newNotesTree = addNodeUnderParent({
      treeData: notesTree,
      newNode,
      parentKey,
      getNodeKey,
      expandParent: true,
    }).treeData;

    const newActiveNode = {
      id: newNode.id,
      path: newActiveNodePath,
    };

    toolbarNewFolderBtnClickHandler({ notesTree: newNotesTree, activeNode: newActiveNode });
  }

  // function pathNavigatorHandleClick(idx) {
  //   if (Number.isSafeInteger(idx) && idx < activeNode.path.length) {
  //     const newActiveNode = {
  //       id: activeNode.path[idx],
  //       path: activeNode.path.slice(0, idx + 1),
  //     };
  //     pathNavigatorClickHandler(newActiveNode);
  //   }
  // }

  // TODO: remove
  console.log(`
    Active ID: ${activeNode.id} \n
    Path: ${activeNode.path} \n
    ${_translatePathtoInfo({ path: activeNode.path, kind: 'title' }) }
    `);

  return (
    <Fragment>
      <Toolbar>
        <Tool label='New Folder' onClick={ newFolder}/>
        <Tool label='New Note' onClick={ newFolder }/>
      </Toolbar>
      <PathNavigator
        path={
          _translatePathtoInfo({
            path: activeNode.path,
            kind: 'title',
          })}
        onClick={ pathNavigatorClickHandler }
      />
      <Tree
        className='tree'
        treeData={ notesTree }
        onChange={ treeChangeHandler }
        getNodeKey={ getNodeKey }
        generateNodeProps={ buildNodeProps }
      />
    </Fragment>
  );
}

export default NotesList;
