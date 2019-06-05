import React from 'react';
import NodeTitle from './NodeTitle';
import Tree from 'react-sortable-tree';
import { collapseFolders } from '../../utils/treeUtils';
import mobileTheme from '../../tree-theme';
import 'react-sortable-tree/style.css';
import styles from './NotesList.module.css';
import AppBar from '@material-ui/core/AppBar';
import MuiToolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import HomeIcon from '@material-ui/icons/Home';
import NewFolderIcon from '@material-ui/icons/CreateNewFolder';
import NewNoteIcon from '@material-ui/icons/NoteAdd';
import GoOutFolderIcon from '@material-ui/icons/ArrowBackIos';
import GoInFolderIcon from '@material-ui/icons/ArrowForwardIos';

// Types
import { TreeItem } from 'react-sortable-tree';
import { nodeTypes } from '../../utils/appCONSTANTS';
export type PropsT = {
  tree: TreeNodeT[],
  size: 'small' | 'medium',
  activeNode: ActiveNodeT,
  rootViewOn: boolean,
  currentFolderName: string,
  treeChangeHandler: (...args: any) => any,
  nodeTitleChangeHandler: (...args: any) => any,
  nodeClickHandler: (params: { id: TreeNodeT["id"], path: TreeNodePathT }) => unknown,
  nodeDoubleClickHandler: (params: { id: TreeNodeT["id"], path: TreeNodePathT }) => unknown,
  deleteNodeBtnHandler: (params: { node: TreeNodeT, path: TreeNodePathT }) => unknown,
  backBtnHandler: (...args: any) => any,
  homeBtnHandler: (...args: any) => any,
  toolbarHandlers: Array<(...args: any) => any>,
  getNodeKey: (...args: any) => any,
};
type generateNodePropsT = ({ node, path }: { node: TreeItem, path: (string|number)[] }) => object;

const _DEFAULT_FOLDER_NAME = '<NO_NAME>';
const _DEFAULT_ROW_HEIGHT = 62;

function NotesList({
  tree,
  size,
  activeNode,
  rootViewOn,
  currentFolderName,
  treeChangeHandler,
  nodeTitleChangeHandler,
  nodeClickHandler,
  nodeDoubleClickHandler,
  deleteNodeBtnHandler,
  backBtnHandler,
  homeBtnHandler,
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
    const buttons = [
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

    if (Array.isArray(node.children)) {
      buttons.unshift(<GoInFolderIcon />);
      if (node.children.length) {
        buttons.unshift(<span>{ node.children.length }</span>);
      }
    }

    return buttons;
  }

  if (!Array.isArray(toolbarHandlers) || (toolbarHandlers.length < 2) || toolbarHandlers.some(cb => (typeof cb !== 'function'))) {
    throw new Error('Invalid toolbar handlers.');
  }

  let generateNodeProps: generateNodePropsT;
  let rowHeight: ((arg: any) => number) | number;
  // if current folder is root, then the tree will be rendered differently.
  if (rootViewOn) {
    generateNodeProps = buildRootFolderNodeProps as generateNodePropsT;
    rowHeight = RootFolderNodeRowHeight;
  } else {
    generateNodeProps = buildNodeProps as generateNodePropsT;
    rowHeight = _DEFAULT_ROW_HEIGHT;
    // When rendering content of a non-root folder, all its child folders are collapsed
    tree = collapseFolders({ tree });
  }

  return (
    <div className={ styles['dnt__notes-list'] }>
      <AppBar position="static" color="primary" className={ styles['dnt__notes-list-header'] }>
        <MuiToolbar className={ rootViewOn ? styles['dnt__notes-list-muitoolbar--root'] : styles['dnt__notes-list-muitoolbar'] } disableGutters>
          { !rootViewOn && (
            <IconButton aria-label={ 'Go up a folder' } color="inherit" onClick={ backBtnHandler }>
              <GoOutFolderIcon />
            </IconButton>
          )}
          <Typography inline variant={ size !== 'small' ? 'h5' : 'h6' } color="inherit">
            { currentFolderName || _DEFAULT_FOLDER_NAME }
          </Typography>
          { !rootViewOn && (
            <IconButton aria-label={ 'Home' } color="inherit" onClick={ homeBtnHandler }>
              <HomeIcon />
            </IconButton>
          )}
        </MuiToolbar>
      </AppBar>
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
      <div className={ styles['dnt__notes-list-appbar'] }>
        <AppBar position="static" color="default">
          <MuiToolbar className={ styles['dnt__notes-list-muitoolbar'] }>
            <IconButton aria-label={ 'New Folder' } color="primary" onClick={ toolbarHandlers[0] }>
              <NewFolderIcon />
            </IconButton>
            <IconButton aria-label={ 'New Note' } color="primary" onClick={ toolbarHandlers[1] }>
              <NewNoteIcon />
            </IconButton>
          </MuiToolbar>
        </AppBar>
      </div>
    </div>
  );
}

export default NotesList;
