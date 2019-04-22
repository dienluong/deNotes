import React from 'react';
import Toolbar from './Toolbar';
import PathNavigator from './PathNavigator';
import Tree from 'react-sortable-tree';
import mobileTheme from '../../tree-theme';
import 'react-sortable-tree/style.css';
import styles from './NotesList.module.css';
import NodeTitle from './NodeTitle';
import HomeIcon from '@material-ui/icons/Home';
import NewFolderIcon from '@material-ui/icons/CreateNewFolder';
import NewNoteIcon from '@material-ui/icons/NoteAdd';

// Types
import { TreeItem } from 'react-sortable-tree';
type PropsT = {
  tree: TreeNodeT[],
  activeNode: ActiveNodeT,
  activePath: string[],
  treeChangeHandler: (...args: any) => any,
  nodeTitleChangeHandler: (...args: any) => any,
  nodeClickHandler: (params: { id: TreeNodeT["id"], path: TreeNodePathT }) => unknown,
  nodeDoubleClickHandler: (params: { id: TreeNodeT["id"], path: TreeNodePathT }) => unknown,
  deleteNodeBtnHandler: (params: { node: TreeNodeT, path: TreeNodePathT }) => unknown,
  addNoteBtnHandler: (params: { path: TreeNodePathT }) => unknown,
  pathNavigatorClickHandler: (...args: any) => any,
  toolbarHandlers: Array<(...args: any) => any>,
  getNodeKey: (...args: any) => any,
};
type generateNodePropsT = ({ node, path }: { node: TreeItem, path: (string|number)[] }) => object;

export const TOOLBAR = {
  NEW_FOLDER: {
    label: 'New Folder',
    icon: <NewFolderIcon />,
  },
  NEW_NOTE: {
    label: 'New Note',
    icon: <NewNoteIcon />,
  },
  BACK_BUTTON: {
    label: 'Home',
    icon: <HomeIcon />,
  },
};

const toolbarHandlersMap = new Map();
const toolbarHandlersMap2 = new Map();

function NotesList({
  tree,
  activeNode,
  activePath,
  treeChangeHandler,
  nodeTitleChangeHandler,
  nodeClickHandler,
  nodeDoubleClickHandler,
  deleteNodeBtnHandler,
  addNoteBtnHandler,
  pathNavigatorClickHandler,
  toolbarHandlers,
  getNodeKey,
}: PropsT) {
  function buildNodeProps({ node, path }: { node: TreeNodeT, path: string[] }) {
    return ({
      title: (<NodeTitle node={ node } path={ path } onSubmit={ nodeTitleChangeHandler } />),
      className: (node.id === activeNode.id) ? `${styles['dnt__tree-node']} ${styles['dnt__tree-node--active']}` : styles['dnt__tree-node'],
      buttons: _buildNodeButtons({ node, path }),
      tabIndex: '0',
      'data-testid': node.id,
      onClick: () => nodeClickHandler({ id: node.id, path }),
      onDoubleClick: () => nodeDoubleClickHandler({ id: node.id, path }),
    });
  }

  function _buildNodeButtons({ node, path }: { node: TreeNodeT, path: string[] }) {
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

  toolbarHandlersMap.set(TOOLBAR.NEW_FOLDER, toolbarHandlers[0])
                    .set(TOOLBAR.NEW_NOTE, toolbarHandlers[1]);
  toolbarHandlersMap2.set(TOOLBAR.BACK_BUTTON, toolbarHandlers[2]);

  return (
    <div className={ styles['dnt__notes-list'] }>
      <Toolbar toolsMap={ toolbarHandlersMap } />
      <Toolbar toolsMap={ toolbarHandlersMap2 } />
      <PathNavigator
        path={ activePath }
        activeSegmentIdx={ activeNode.path.indexOf(activeNode.id) }
        onClick={ pathNavigatorClickHandler }
      />
      <Tree
        className={ 'tree ' + styles.dnt__tree }
        treeData={ tree }
        theme={ mobileTheme as any }
        onChange={ treeChangeHandler }
        getNodeKey={ getNodeKey }
        generateNodeProps={ buildNodeProps as generateNodePropsT }
      />
    </div>
  );
}

export default NotesList;
