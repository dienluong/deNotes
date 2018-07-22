import { connect } from 'react-redux';
import NotesList from './widgets/NotesList';
import { changeActiveNodeAction, changeNotesTreeAction } from '../redux/actions/notesListActions';

// const getNodeKey = ({ treeIndex }) => treeIndex;
// class NotesList extends React.Component {
//   constructor(props) {
//     super(props);
// this.state = {
//   notesTree: sampleNotes,
//   activeNode: {
//     id: null,
//     path: [],
//   },
// };

// this.handleChange = this.handleChange.bind(this);
// this.buildNodeProps = this.buildNodeProps.bind(this);
// this.newFolder = this.newFolder.bind(this);
// }
// }

/**
 * @param dispatch {function}
 * @param notesTree {Array}
 * @param activeNode {Object} Object with properties id and path
 */
function dispatchChangeActions({ dispatch, notesTree, activeNode = null }) {
  dispatch(changeNotesTreeAction(notesTree));
  // if activeNode null, then the active node did not change
  if (activeNode !== null && 'id' in activeNode && 'path' in activeNode) {
    dispatch(changeActiveNodeAction({
      id: activeNode.id,
      path: activeNode.path,
    }));
  }
}


function mapStateToProps(state) {
  return {
    notesTree: state.notesTree,
    activeNode: state.activeNode,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    treeChangeHandler: function treeChangeHandler(notesTree) {
      return dispatch(changeNotesTreeAction(notesTree));
    },
    nodeChangeHandler: function nodeChangeHandler({ notesTree, activeNode }) {
      return dispatchChangeActions({ dispatch, notesTree, activeNode });
    },
    nodeClickHandler: function nodeClickHandler({ id = null, path = [] }) {
      return dispatch(changeActiveNodeAction({ id, path }));
    },
    deleteNodeBtnHandler: function deleteNodeBtnHandler({ notesTree, activeNode = null }) {
      return dispatchChangeActions({ dispatch, notesTree, activeNode });
    },
    addNodeBtnHandler: function deleteNodeBtnHandler({ notesTree, activeNode = null }) {
      return dispatchChangeActions({ dispatch, notesTree, activeNode });
    },
    toolbarNewFolderBtnClickHandler: function toolbarNewFolderBtnClickHandler({ notesTree, activeNode = null }) {
      return dispatchChangeActions({ dispatch, notesTree, activeNode });
    },
    toolbarNewNoteBtnClickHandler: function toolbarNewNoteBtnClickHandler({ notesTree, activeNode = null }) {
      return dispatchChangeActions({ dispatch, notesTree, activeNode });
    },
    pathNavigatorClickHandler: function pathNavigatorClickHandler({ id = null, path = [] }) {
      return dispatch(changeActiveNodeAction({ id, path }));
    },
  };
}

const NotesListContainer = connect(mapStateToProps, mapDispatchToProps)(NotesList);
export default NotesListContainer;

