import { connect } from 'react-redux';
import NotesList from './widgets/NotesList';
import {
  selectNodeAction,
  navigatePathAction,
  changeNotesTreeAction,
  changeNodeTitleAction,
  deleteNodeAction,
  addNoteAction,
  switchActiveNodeOnDelete,
  switchActiveNodeOnAdd,
  addAndSelectNode,
}
  from '../redux/actions/notesListActions';

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
      return dispatch(navigatePathAction({ idx }));
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
    toolbarNewNoteBtnClickHandler() {
      return dispatch(addAndSelectNode({ kind: 'item' }));
    },
  };
}

const NotesListContainer = connect(mapStateToProps, mapDispatchToProps)(NotesList);
export default NotesListContainer;

