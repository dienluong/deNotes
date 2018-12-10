import React from 'react';
import Toolbar from './Toolbar';
import PathNavigator from './PathNavigator';
import Tree from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import styles from './NotesList.module.css';
import NodeTitle from './NodeTitle';

// Types
type PropsT = {
  tree: Array<TreeNodeT>,
  activeNode: ActiveNodeT,
  activePath: Array<string>,
  treeChangeHandler: (...args: any) => any;
  nodeTitleChangeHandler: (...args: any) => any,
  nodeClickHandler: (params: { id: TreeNodeT["id"], path: TreeNodePathT }) => unknown,
  deleteNodeBtnHandler: (params: { node: TreeNodeT, path: TreeNodePathT }) => unknown,
  addNoteBtnHandler: (params: { path: TreeNodePathT }) => unknown,
  pathNavigatorClickHandler: (...args: any) => any,
  toolbarHandlersMap: any,
  getNodeKey: (...args: any) => any,
};

function NotesList({
  tree,
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
}: PropsT) {
  function buildNodeProps({ node, path }: { node: TreeNodeT, path: Array<string> }) {
    return ({
      title: (<NodeTitle node={ node } path={ path } onSubmit={ nodeTitleChangeHandler } />),
      className: (node.id === activeNode.id) ? `${styles['dnt__tree-node']} ${styles['dnt__tree-node--active']}` : styles['dnt__tree-node'],
      buttons: _buildNodeButtons({ node, path }),
      tabIndex: '0',
      'data-testid': node.id,
      onClick: () => nodeClickHandler({ id: node.id, path }),
    });
  }

  function _buildNodeButtons({ node, path }: { node: TreeNodeT, path: Array<string> }) {
    let buttons = [
      <button
        className={ styles['dnt__tree-node-btn'] }
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
          className={ styles['dnt__tree-node-btn'] }
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

  return (
    <div className={ styles["dnt__notes-list"] }>
      <Toolbar toolsMap={ toolbarHandlersMap } />
      <PathNavigator
        path={ activePath }
        activeSegmentIdx={ activeNode.path.indexOf(activeNode.id) }
        onClick={ pathNavigatorClickHandler }
      />
      <Tree
        className={ 'tree ' + styles.dnt__tree }
        treeData={ tree }
        onChange={ treeChangeHandler }
        getNodeKey={ getNodeKey }
        generateNodeProps={ buildNodeProps }
      />
    </div>
  );
}

export default NotesList;