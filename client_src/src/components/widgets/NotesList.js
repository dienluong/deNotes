import React, { Fragment } from 'react';
import Toolbar from './Toolbar';
import PathNavigator from './PathNavigator';
import Tree, { find } from 'react-sortable-tree';
import { getNodeKey } from '../../utils/tree-utils';

import 'react-sortable-tree/style.css';
import './NotesList.css';
import NodeTitle from './NodeTitle';

const ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER;

function NotesList({
  notesTree,
  activeNode,
  treeChangeHandler,
  nodeTitleChangeHandler,
  nodeClickHandler,
  deleteNodeBtnHandler,
  addNoteBtnHandler,
  pathNavigatorClickHandler,
  toolbarHandlersMap,
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
            addNoteBtnHandler({ path });
          }}
        >
          +
        </button>);
    }

    return buttons;
  }

  // TODO: remove
  console.log(`
    Active ID: ${activeNode.id} \n
    Path: ${activeNode.path} \n
    ${_translatePathtoInfo({ path: activeNode.path, kind: 'title' }) }
    `);

  return (
    <Fragment>
      <Toolbar toolsMap={ toolbarHandlersMap } />
      <PathNavigator
        path={ _translatePathtoInfo({ path: activeNode.path, kind: 'title' }) }
        activeSegmentIdx={ activeNode.path.indexOf(activeNode.id) }
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
