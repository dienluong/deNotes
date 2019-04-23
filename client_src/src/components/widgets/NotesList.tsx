import React from 'react';
import unescape from 'lodash-es/unescape';
import Toolbar from './Toolbar';
import Back from './Back';
import NodeTitle from './NodeTitle';
import Tree from 'react-sortable-tree';
import { collapseFolders, findDeepestFolder } from '../../utils/treeUtils';
import mobileTheme from '../../tree-theme';
import 'react-sortable-tree/style.css';
import styles from './NotesList.module.css';
import Typography from '@material-ui/core/Typography';
import HomeIcon from '@material-ui/icons/Home';
import NewFolderIcon from '@material-ui/icons/CreateNewFolder';
import NewNoteIcon from '@material-ui/icons/NoteAdd';
import GoUpFolder from '@material-ui/icons/ArrowBack';

// Types
import { TreeItem } from 'react-sortable-tree';
import { nodeTypes } from '../../utils/appCONSTANTS';
type PropsT = {
  tree: TreeNodeT[],
  activeNode: ActiveNodeT,
  rootFolderName: string,
  activePath: string[],
  treeChangeHandler: (...args: any) => any,
  nodeTitleChangeHandler: (...args: any) => any,
  nodeClickHandler: (params: { id: TreeNodeT["id"], path: TreeNodePathT }) => unknown,
  nodeDoubleClickHandler: (params: { id: TreeNodeT["id"], path: TreeNodePathT }) => unknown,
  deleteNodeBtnHandler: (params: { node: TreeNodeT, path: TreeNodePathT }) => unknown,
  addNoteBtnHandler: (params: { path: TreeNodePathT }) => unknown,
  pathNavigatorClickHandler: ({ idx }: { idx: number }) => any,
  toolbarHandlers: Array<(...args: any) => any>,
  getNodeKey: (...args: any) => any,
};
type generateNodePropsT = ({ node, path }: { node: TreeItem, path: (string|number)[] }) => object;

const TOOLBAR = {
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

const PATHNAV = {
  BACK_BUTTON: {
    label: 'Go up a folder',
    icon: <GoUpFolder />,
  },
};


const _DEFAULT_FOLDER_NAME = '<NO_NAME>';
const _DEFAULT_ROW_HEIGHT = 62;

const dummyCb = () => {};
const toolbarHandlersMap = new Map();
toolbarHandlersMap.set(TOOLBAR.BACK_BUTTON, dummyCb)
                  .set(TOOLBAR.NEW_FOLDER, dummyCb)
                  .set(TOOLBAR.NEW_NOTE, dummyCb);
const HandlersMapKeys = toolbarHandlersMap.keys();

function NotesList({
  tree,
  activeNode,
  rootFolderName,
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
  function buildNodeProps({ node, path }: { node: TreeNodeT, path: TreeNodePathT }) {
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

  // make visible only folder nodes and direct child nodes (of any type) of root
  function buildRootFolderNodeProps({ node, path }: { node: TreeNodeT, path: TreeNodePathT }) {
    if (node.type === nodeTypes.FOLDER || path.length === 1) {
      return buildNodeProps({ node, path });
    } else {
      return ({
        className: styles['dnt__tree-node--invisible'],
      })
    }
  }

  // give a height only to folder nodes and to direct child nodes (of any type) of root
  function RootFolderNodeRowHeight({ node, path }:{ node: TreeNodeT, path: TreeNodePathT }) {
    if (node.type === nodeTypes.FOLDER || path.length === 1) {
      return _DEFAULT_ROW_HEIGHT;
    } else {
      return 0;
    }
  }

  function _buildNodeButtons({ node, path }: { node: TreeNodeT, path: TreeNodePathT }) {
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

  if (Array.isArray(toolbarHandlers) && toolbarHandlers.length) {
    for (let i = 0, key = HandlersMapKeys.next(); !key.done; i++, key = HandlersMapKeys.next()) {
      if (typeof toolbarHandlers[i] === 'function') {
        toolbarHandlersMap.set(key.value, toolbarHandlers[i]);
      }
    }
  }

  let generateNodeProps = buildNodeProps as generateNodePropsT;
  let rowHeight: ((arg: any) => number) | number = _DEFAULT_ROW_HEIGHT;
  let parentFolderName = _DEFAULT_FOLDER_NAME;
  const parentIdx = findDeepestFolder(activeNode.path);
  if (parentIdx === null) {
    throw new Error(`Invalid active path: ${ activeNode.path }`);
  }
  // if current folder is root, then the tree will be rendered differently.
  if (parentIdx === -1) {
    generateNodeProps = buildRootFolderNodeProps as generateNodePropsT;
    rowHeight = RootFolderNodeRowHeight;
    parentFolderName = rootFolderName;
  } else {
    // When rendering content of a non-root folder, all its child folders are collapsed
    tree = collapseFolders({ tree });
    parentFolderName = activePath[parentIdx];
  }

  return (
    <div className={ styles['dnt__notes-list'] }>
      <Toolbar toolsMap={ toolbarHandlersMap } />
      <Back label={ PATHNAV.BACK_BUTTON.label } activeSegmentIdx={ parentIdx } onClick={ pathNavigatorClickHandler } >
        { PATHNAV.BACK_BUTTON.icon }
      </Back>
      <Typography variant="h6" color="primary">
        { unescape(parentFolderName || _DEFAULT_FOLDER_NAME) }
      </Typography>
      <Tree
        className={ 'tree ' + styles.dnt__tree }
        treeData={ tree }
        theme={ mobileTheme as any }
        onChange={ treeChangeHandler }
        getNodeKey={ getNodeKey }
        generateNodeProps={ generateNodeProps }
        // @ts-ignore -- bug in react-sortable-tree/index.d.ts for rowHeight
        rowHeight={ rowHeight }
      />
    </div>
  );
}

export default NotesList;
