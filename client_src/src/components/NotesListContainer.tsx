import { connect } from 'react-redux';
import { selectTitlesFromActivePath, selectChildrenOfActiveFolder } from '../redux/selectors';
import * as rootReducer from '../redux/reducers';
import NotesListDrawer from './widgets/NotesListDrawer';
import {
  selectNodeThunkAction,
  goToRootAction,
  goUpAFolderAction,
  changeNotesFolderThunkAction,
  changeNodeTitleAction,
  deleteNodeThunkAction,
  addAndSelectNodeThunkAction,
} from '../redux/actions/notesListActions';

import { findDeepestFolder, getNodeKey } from '../utils/treeUtils';
import { nodeTypes } from '../utils/appCONSTANTS';

// Types
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
interface MapDispatchPropsT {
  treeChangeHandler: (params: any) => AnyAction;
  nodeTitleChangeHandler: (params: { node: TreeNodeT, title: string, path: TreeNodePathT }) => AnyAction;
  nodeClickHandler: (params: any) => AnyAction;
  nodeDoubleClickHandler: (params: any) => AnyAction;
  deleteNodeBtnHandler: (params: any) => Promise<AnyAction>;
  backBtnHandler: () => AnyAction;
  homeBtnHandler: () => AnyAction;
  toolbarHandlers: Array<() => AnyAction>;
}
interface MapStatePropsT {
  tree: TreeNodeT[];
  activeNode: ActiveNodeT;
  rootViewOn: boolean;
  currentFolderName: string;
}

export const DEFAULT_ROOT_FOLDER_NAME = 'HOME';

function mapStateToProps(state: AppStateT): MapStatePropsT {
  const activePathByTitles = selectTitlesFromActivePath(state);

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

  const activeNode = rootReducer.selectActiveNode(state);
  // Get the siblings of the current active node (including itself). The children will be passed as prop to the component
  const parentIdx = findDeepestFolder(activeNode.path);
  if (parentIdx === null) {
    throw new Error(`Invalid active path: ${ activeNode.path }`);
  }

  let children = selectChildrenOfActiveFolder(state) as TreeNodeT[];
  let rootViewOn = false;
  let folderName = '';
  // If parent is root then...
  if (parentIdx === -1) {
    rootViewOn = true;
    folderName = DEFAULT_ROOT_FOLDER_NAME;
  } else {
    rootViewOn = false;
    folderName = activePathByTitles[parentIdx];
  }

  return {
    tree: children,
    activeNode,
    rootViewOn,
    currentFolderName: folderName,
  };
}

// TODO: Remove
// Memoization.
mapStateToProps.cache = {} as { notesTree: any, activeNode: any, activePath: any, editorContent: any };

function mapDispatchToProps(dispatch: ThunkDispatch<AppStateT, any, AnyAction>): MapDispatchPropsT {
  function toolbarNewFolderBtnHandler() {
    return dispatch(addAndSelectNodeThunkAction({ kind: nodeTypes.FOLDER }));
  }

  function toolbarNewNoteBtnHandler() {
    return dispatch(addAndSelectNodeThunkAction({ kind: nodeTypes.ITEM }));
  }

  const toolbarHandlers = [toolbarNewFolderBtnHandler, toolbarNewNoteBtnHandler];

  return {
    treeChangeHandler(tree) {
      return dispatch(changeNotesFolderThunkAction({ folder: tree }));
    },
    nodeTitleChangeHandler({ node, title, path }) {
      // We are not using the path received from the NotesList component because that path is not for the entire tree;
      // remember that NotesList only receives and renders a given leaf of the whole tree.
      return dispatch(changeNodeTitleAction({ node, title }));
    },
    backBtnHandler() {
      return dispatch(goUpAFolderAction());
    },
    homeBtnHandler() {
      return dispatch(goToRootAction());
    },
    nodeClickHandler({ id = '', path = [] }) {
      return dispatch(selectNodeThunkAction({ id, path }));
    },
    nodeDoubleClickHandler({ id, path }) {
      return dispatch(selectNodeThunkAction({ id, path }))
    },
    deleteNodeBtnHandler({ node, path }) {
      // We are not using the path received from the NotesList component because that path is not for the entire tree;
      // remember that NotesList only receives and renders a given leaf of the whole tree.
      return dispatch(deleteNodeThunkAction({ node }));
    },
    toolbarHandlers,
  };
}

function mergeProps(stateProps: object, dispatchProps: object, ownProps: object) {
  return Object.assign({}, ownProps, stateProps, dispatchProps, { getNodeKey });
}

const NotesListContainer = connect(mapStateToProps, mapDispatchToProps, mergeProps)(NotesListDrawer);
export default NotesListContainer;
