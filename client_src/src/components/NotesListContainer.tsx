import { connect } from 'react-redux';
import { selectTitlesFromActivePath } from '../redux/selectors';
import * as rootReducer from '../redux/reducers';
import NotesList from './widgets/NotesList';
import {
  selectNodeThunkAction,
  navigatePathThunkAction,
  changeNotesTreeBranchThunkAction,
  changeNodeTitleAction,
  deleteNodeThunkAction,
  addAndSelectNodeThunkAction,
} from '../redux/actions/notesListActions';

import { getNodeAtPath } from 'react-sortable-tree';
import { getNodeKey, findClosestParent } from '../utils/treeUtils';

// Types
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
interface DispatchProps {
  treeChangeHandler: (params: any) => Promise<AnyAction>;
  nodeTitleChangeHandler: (params: { node: TreeNodeT, title: string, path: TreeNodePathT }) => AnyAction;
  pathNavigatorClickHandler: (params: { idx: number }) => Promise<AnyAction>;
  nodeClickHandler: (params: any) => Promise<AnyAction>;
  deleteNodeBtnHandler: (params: any) => Promise<AnyAction>;
  addNoteBtnHandler: (params: any) => AnyAction;
  toolbarHandlersMap: Map<string, () => AnyAction>;
}

export const TOOLBAR_LABELS = {
  NEW_FOLDER: 'New Folder',
  NEW_NOTE: 'New Note',
};

function mapStateToProps(state: AppStateT) {
  const activePathByTitles = selectTitlesFromActivePath(state);

  // const activePath = translatePathToInfo({ notesTree: state.notesTree, path: state.activeNode.path, kind: 'title' });
  if (mapStateToProps.cache.notesTree !== rootReducer.selectNotesTree(state)) {
    console.log('~~~~~~~~~~~~~~~~ Notes Tree Changed');
    mapStateToProps.cache.notesTree = rootReducer.selectNotesTree(state);
  } else {
    console.log('~~~~~~~~~~~~~~~~ Same Notes Tree');
  }
  if (mapStateToProps.cache.activeNode !== rootReducer.selectActiveNode(state)) {
    console.log('~~~~~~~~~~~~~~~~ Active Node Changed');
    mapStateToProps.cache.activeNode = rootReducer.selectActiveNode(state);
  } else {
    console.log('~~~~~~~~~~~~~~~~ Same Active Node');
  }
  if (mapStateToProps.cache.activePath !== activePathByTitles) {
    console.log('~~~~~~~~~~~~~~~~ Active Path Changed');
    mapStateToProps.cache.activePath = activePathByTitles;
  } else {
    console.log('~~~~~~~~~~~~~~~~ Same Active Path');
  }
  if (mapStateToProps.cache.editorContent !== rootReducer.selectEditorContent(state)) {
    console.log('~~~~~~~~~~~~~~~~ Editor Content Changed');
    mapStateToProps.cache.editorContent = rootReducer.selectEditorContent(state);
  } else {
    console.log('~~~~~~~~~~~~~~~~ Same Editor Content');
  }
  // TODO: Remove ABOVE

  // Get the branch of the whole tree based on the current active node. This branch will be passed as prop to the component
  const activePath: string[] = rootReducer.selectActiveNodePath(state);
  const parentIdx: number | null = findClosestParent(activePath);
  const parentPath: string[] = parentIdx !== null ? activePath.slice(0, parentIdx + 1) : [activePath[0]];
  const parentNodeInfo = getNodeAtPath({
    getNodeKey,
    treeData: rootReducer.selectNotesTreeTree(state),
    path: parentPath,
    ignoreCollapsed: false,
  });

  let branch: NotesTreeT["tree"] = [];
  if (parentNodeInfo && parentNodeInfo.node) {
    branch = (parentNodeInfo.node as TreeNodeT).children || [];
  }

  return {
    tree: branch,
    activeNode: rootReducer.selectActiveNode(state),
    activePath: activePathByTitles,
  };
}

// TODO: Remove
// Memoization.
mapStateToProps.cache = {} as { notesTree: any, activeNode: any, activePath: any, editorContent: any };

function mapDispatchToProps(dispatch: ThunkDispatch<AppStateT, any, AnyAction>): DispatchProps {
  function toolbarNewFolderBtnHandler() {
    return dispatch(addAndSelectNodeThunkAction({ kind: 'folder' }));
  }

  function toolbarNewNoteBtnHandler() {
    return dispatch(addAndSelectNodeThunkAction({ kind: 'item' }));
  }

  const toolbarHandlersMap = new Map();

  toolbarHandlersMap.set(TOOLBAR_LABELS.NEW_FOLDER, toolbarNewFolderBtnHandler);
  toolbarHandlersMap.set(TOOLBAR_LABELS.NEW_NOTE, toolbarNewNoteBtnHandler);

  return {
    treeChangeHandler(tree) {
      return dispatch(changeNotesTreeBranchThunkAction({ branch: tree }));
    },
    nodeTitleChangeHandler({ node, title, path }) {
      // We are not using the path received from the NotesList component because that path is not for the entire tree;
      // remember that NotesList only receives and renders a given leaf of the whole tree.
      return dispatch(changeNodeTitleAction({ node, title }));
    },
    pathNavigatorClickHandler({ idx }) {
      return dispatch(navigatePathThunkAction({ idx }));
    },
    nodeClickHandler({ id = '', path = [] }) {
      // We are not using the path received from the NotesList component because that path is not for the entire tree;
      // remember that NotesList only receives and renders a given leaf of the whole tree.
      return dispatch(selectNodeThunkAction({ id }));
    },
    deleteNodeBtnHandler({ node, path }) {
      // We are not using the path received from the NotesList component because that path is not for the entire tree;
      // remember that NotesList only receives and renders a given leaf of the whole tree.
      return dispatch(deleteNodeThunkAction({ node }));
    },
    addNoteBtnHandler({ path } ) {
      // We are not using the path received from the NotesList component because that path is not for the entire tree;
      // remember that NotesList only receives and renders a given leaf of the whole tree.
      return dispatch(addAndSelectNodeThunkAction({ kind: 'item' }));
    },
    toolbarHandlersMap: toolbarHandlersMap,
  };
}

function mergeProps(stateProps: object, dispatchProps: object, ownProps: object) {
  return Object.assign({}, ownProps, stateProps, dispatchProps, { getNodeKey });
}

const NotesListContainer = connect(mapStateToProps, mapDispatchToProps, mergeProps)(NotesList);
export default NotesListContainer;
