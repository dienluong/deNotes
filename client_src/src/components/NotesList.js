// TODO: Delete Note.js
// import Note from './Note';
// import minimalTheme from 'react-sortable-tree-theme-minimal';

import { connect } from 'react-redux';
import NotesListWidget from './widgets/NotesListWidget';
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

function dispatchActions({ dispatch, notesTree, activeNode = null }) {
  dispatch(changeNotesTreeAction(notesTree));
  // if activeNode null, then the active node did not change
  if (activeNode !== null) {
    dispatch(changeActiveNodeAction({
      id: 'id' in activeNode && activeNode.id,
      path: 'path' in activeNode && activeNode.path,
    }));
  }
}


function mapStateToProps(state) {
  return {
    notesTree: state.notesTree,
    activeNode: state.activeNode,
    // path: NotesList._extractInfoFromPath({
    //   path: state.activeNode.path,
    //   kind: 'title' }),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    treeChangeHandler: function treeChangeHandler(notesTree) {
      // this.setState({
      //   notesTree,
      // });
      dispatch(changeNotesTreeAction(notesTree));
    },
    nodeChangeHandler: function nodeChangeHandler(changedTree) {
      dispatch(changeNotesTreeAction(changedTree));
    },
    nodeClickHandler: function nodeClickHandler({ node, path }) {
      // TODO: remove console.log
      console.log(`Active ID: ${node.id} // PATH: ${ path }`);
      // this.setState({
      //   activeNode: {
      //     id: node.id,
      //     path: path || [],
      //   },
      // });
      dispatch(changeActiveNodeAction({ id: 'id' in node && node.id, path }));
    },
    deleteNodeBtnHandler: function deleteNodeBtnHandler({ notesTree, activeNode = null }) {
      dispatchActions({ dispatch, notesTree, activeNode });
    },
    addNodeBtnHandler: function deleteNodeBtnHandler({ notesTree, activeNode = null }) {
      dispatchActions({ dispatch, notesTree, activeNode });
    },
    toolbarNewFolderBtnClickHandler: function toolbarNewFolderBtnClickHandler({ notesTree, activeNode = null }) {
      dispatchActions({ dispatch, notesTree, activeNode });
    },
    toolbarNewNoteBtnClickHandler: function toolbarNewNoteBtnClickHandler({ notesTree, activeNode = null }) {
      dispatchActions({ dispatch, notesTree, activeNode });
    },
  };
}

const NotesList = connect(mapStateToProps, mapDispatchToProps)(NotesListWidget);
export default NotesList;

