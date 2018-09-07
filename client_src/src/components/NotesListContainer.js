import { connect } from 'react-redux';
import { selectTitleFromId } from '../redux/selectors';
import NotesList from './widgets/NotesList';
import {
  selectNodeAction,
  navigatePathAction,
  changeNotesTreeAction,
  changeNodeTitleAction,
  deleteNodeAction,
  switchActiveNodeOnDeleteAction,
  addAndSelectNodeAction,
} from '../redux/actions/notesListActions';

import { getNodeKey } from '../utils/treeUtils';

function mapStateToProps(state) {
  const activePath = selectTitleFromId(state);

  // const activePath = translatePathToInfo({ notesTree: state.notesTree, path: state.activeNode.path, kind: 'title' });
  if (mapStateToProps.cache.notesTree !== state.notesTree) {
    console.log('~~~~~~~~~~~~~~~~ Notes Tree Changed');
    mapStateToProps.cache.notesTree = state.notesTree;
  } else {
    console.log('~~~~~~~~~~~~~~~~ Same Notes Tree');
  }
  if (mapStateToProps.cache.activeNode !== state.activeNode) {
    console.log('~~~~~~~~~~~~~~~~ Active Node Changed');
    mapStateToProps.cache.activeNode = state.activeNode;
  } else {
    console.log('~~~~~~~~~~~~~~~~ Same Active Node');
  }
  if (mapStateToProps.cache.activePath !== activePath) {
    console.log('~~~~~~~~~~~~~~~~ Active Path Changed');
    mapStateToProps.cache.activePath = activePath;
  } else {
    console.log('~~~~~~~~~~~~~~~~ Same Active Path');
  }
  // TODO: Remove ABOVE

  return {
    notesTree: state.notesTree,
    activeNode: state.activeNode,
    activePath,
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
    treeChangeHandler(notesTree) {
      return dispatch(changeNotesTreeAction(notesTree));
    },
    nodeTitleChangeHandler({ node, title, path }) {
      return dispatch(changeNodeTitleAction({ node, title, path }));
    },
    pathNavigatorClickHandler({ idx }) {
      return dispatch(navigatePathAction({ idx }));
    },
    nodeClickHandler({ id = '', path = [] }) {
      return dispatch(selectNodeAction({ id, path }));
    },
    deleteNodeBtnHandler({ node, path }) {
      dispatch(deleteNodeAction({ node, path }));
      return dispatch(switchActiveNodeOnDeleteAction({ id: node.id, path }));
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
