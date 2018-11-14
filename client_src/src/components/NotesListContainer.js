import { connect } from 'react-redux';
import { selectTitlesFromActivePath } from '../redux/selectors';
import * as rootReducer from '../redux/reducers';
import NotesList from './widgets/NotesList';
import {
  selectNodeThunkAction,
  navigatePathAction,
  changeNotesTreeAction,
  changeNodeTitleAction,
  deleteNodeThunkAction,
  addAndSelectNodeThunkAction,
} from '../redux/actions/notesListActions';

import { getNodeKey } from '../utils/treeUtils';

export const TOOLBAR_LABELS = {
  NEW_FOLDER: 'New Folder',
  NEW_NOTE: 'New Note',
};

function mapStateToProps(state) {
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

  return {
    tree: rootReducer.selectNotesTreeTree(state),
    activeNode: rootReducer.selectActiveNode(state),
    activePath: activePathByTitles,
  };
}

// TODO: Remove
// Memoization.
mapStateToProps.cache = {};

function mapDispatchToProps(dispatch) {
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
      return dispatch(changeNotesTreeAction({ tree }));
    },
    nodeTitleChangeHandler({ node, title, path }) {
      return dispatch(changeNodeTitleAction({ node, title, path }));
    },
    pathNavigatorClickHandler({ idx }) {
      return dispatch(navigatePathAction({ idx }));
    },
    nodeClickHandler({ id = '', path = [] }) {
      return dispatch(selectNodeThunkAction({ id, path }));
    },
    deleteNodeBtnHandler({ node, path }) {
      return dispatch(deleteNodeThunkAction({ node, path }));
    },
    addNoteBtnHandler({ path }) {
      return dispatch(addAndSelectNodeThunkAction({ kind: 'item', path }));
    },
    toolbarHandlersMap: toolbarHandlersMap,
  };
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, ownProps, stateProps, dispatchProps, { getNodeKey });
}

const NotesListContainer = connect(mapStateToProps, mapDispatchToProps, mergeProps)(NotesList);
export default NotesListContainer;
