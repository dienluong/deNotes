import { connect } from 'react-redux';
import NotesList from './widgets/NotesList';
import {
  selectNodeAction,
  navigateToNodeAction,
  changeNotesTreeAction,
  changeNodeTitleAction,
  deleteNodeAction,
  addNoteAction,
  switchActiveNodeOnDelete,
  switchActiveNodeOnAdd,
  addAndSelectNode,
}
  from '../redux/actions/notesListActions';

// /**
//  * @param dispatch {function}
//  * @param notesTree {Array}
//  * @param activeNode {Object} Object with properties id and path
//  */
// function dispatchChangeActions({ dispatch, notesTree, activeNode = null }) {
//   dispatch(changeNotesTreeAction(notesTree));
  // if activeNode null, then the active node did not change
  // if (activeNode !== null && 'id' in activeNode && 'path' in activeNode) {
  //   dispatch(selectNodeAction({
  //     id: activeNode.id,
  //     path: activeNode.path,
  //   }));
  // }
// }


function mapStateToProps(state) {
  return {
    notesTree: state.notesTree,
    activeNode: state.activeNode,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    treeChangeHandler(notesTree) {
      return dispatch(changeNotesTreeAction(notesTree));
    },
    nodeTitleChangeHandler({ node, title, path }) {
      return dispatch(changeNodeTitleAction({ node, title, path }));
    },
    pathNavigatorClickHandler({ idx }) {
      return dispatch(navigateToNodeAction({ idx }));
    },
    nodeClickHandler({ id = null, path = [] }) {
      return dispatch(selectNodeAction({ id, path }));
    },
    deleteNodeBtnHandler({ node, path }) {
      dispatch(deleteNodeAction({ node, path }));
      return dispatch(switchActiveNodeOnDelete({ id: node.id, path }));
    },
    addNoteBtnHandler({ path }) {
      dispatch(addNoteAction({ path }));
      return dispatch(switchActiveNodeOnAdd({ path }));
    },
    toolbarNewFolderBtnClickHandler() {
      return dispatch(addAndSelectNode({ kind: 'folder' }));
    },
    // TODO: TO BE CONTINUED moving new state production from NotesList component to reducers.
    toolbarNewNoteBtnClickHandler() {
      return dispatch(addAndSelectNode({ kind: 'item' }));
    },
  };
}

const NotesListContainer = connect(mapStateToProps, mapDispatchToProps)(NotesList);
export default NotesListContainer;

