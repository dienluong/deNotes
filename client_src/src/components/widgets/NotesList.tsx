import React from 'react';
import Toolbar from './Toolbar';
import PathNavigator from './PathNavigator';
import Tree from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import styles from './NotesList.module.css';
import NodeTitle from './NodeTitle';

type PropsT = {
  tree: Array<TreeNodeT>,
  activeNode: ActiveNodeT,
  activePath: Array<string>,
  treeChangeHandler: (params:any) => unknown,
  nodeTitleChangeHandler: (params:any) => unknown,
  nodeClickHandler: (params:any) => unknown,
  deleteNodeBtnHandler: (params:any) => unknown,
  addNoteBtnHandler: (params:any) => unknown,
  pathNavigatorClickHandler: (params:any) => unknown,
  toolbarHandlersMap: Map<string, (params:any) => unknown>,
  getNodeKey: (params:any) => unknown,
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
