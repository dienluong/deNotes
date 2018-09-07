import React, { Fragment } from 'react';
import Toolbar from './Toolbar';
import PathNavigator from './PathNavigator';
import Tree from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import './NotesList.css';
import NodeTitle from './NodeTitle';

function NotesList({
  notesTree,
  activeNode,
  activePath,
  treeChangeHandler,
  nodeTitleChangeHandler,
  nodeClickHandler,
  deleteNodeBtnHandler,
  addNoteBtnHandler,
  pathNavigatorClickHandler,
  toolbarHandlersMap,
  getNodeKey,
}) {
  function buildNodeProps({ node, path }) {
    return ({
      title: (<NodeTitle node={ node } path={ path } onSubmit={ nodeTitleChangeHandler } />),
      className: (node.id === activeNode.id) ? 'dnt__active-tree-node' : '',
      buttons: _buildNodeButtons({ node, path }),
      tabIndex: '0',
      onClick: () => nodeClickHandler({ id: node.id, path }),
      onFocus: () => console.log('Focused: ' + node.title),
      onBlur: () => console.log('unFocused: ' + node.title),
    });
  }

  function _buildNodeButtons({ node, path }) {
    let buttons = [
      <button
        className='dnt__tree-node-btn'
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
          className='dnt__tree-node-btn'
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
  // console.log(`
  //   Tree: ${JSON.stringify(notesTree)} \n
  //   Active ID: ${activeNode.id} \n
  //   Path: ${activeNode.path} \n
  //   ${ activePath }
  // `);

  return (
    <Fragment>
      <Toolbar toolsMap={ toolbarHandlersMap } />
      <PathNavigator
        path={ activePath }
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
