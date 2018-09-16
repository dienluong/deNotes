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
  addAndSelectNodeAction,
} from '../redux/actions/notesListActions';

import { getNodeKey } from '../utils/treeUtils';

function mapStateToProps(state) {
  const activePathTitles = selectTitlesFromActivePath(state);

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
  if (mapStateToProps.cache.activePath !== activePathTitles) {
    console.log('~~~~~~~~~~~~~~~~ Active Path Changed');
    mapStateToProps.cache.activePath = activePathTitles;
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
    notesTree: rootReducer.selectNotesTreeTree(state),
    activeNode: rootReducer.selectActiveNode(state),
    activePath: activePathTitles,
  };
}

// TODO: Remove
// Memoization.
mapStateToProps.cache = {};

function mapDispatchToProps(dispatch) {
  function toolbarNewFolderBtnHandler() {
    return dispatch(addAndSelectNodeAction({ kind: 'folder' }));
  }

  function toolbarNewNoteBtnHandler() {
    return dispatch(addAndSelectNodeAction({ kind: 'item' }));
  }

  const toolbarHandlersMap = new Map();

  toolbarHandlersMap.set('New Folder', toolbarNewFolderBtnHandler);
  toolbarHandlersMap.set('New Note', toolbarNewNoteBtnHandler);

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
      return dispatch(addAndSelectNodeAction({ kind: 'item', path }));
    },
    toolbarHandlersMap: toolbarHandlersMap,
  };
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, ownProps, stateProps, dispatchProps, { getNodeKey });
}

const NotesListContainer = connect(mapStateToProps, mapDispatchToProps, mergeProps)(NotesList);
export default NotesListContainer;
