import { connect } from 'react-redux';
import Editor from './widgets/Editor';
import { changeContentAction } from '../redux/actions/editorActions';

function mapStateToProps(state) {
  return {
    id: state.editorContent.id,
    delta: state.editorContent.delta,
    content: state.editorContent.content,
    dateCreated: state.editorContent.dateCreated,
    dateModified: state.editorContent.dateModified,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    contentChangeHandler(content, delta, source, editor) {
      return dispatch(changeContentAction({ editor, content }));
    },
  };
}

// function mergeProps(stateProps, dispatchProps, ownProps) {
//   return Object.assign({}, ownProps, stateProps, dispatchProps);
// }

const EditorContainer = connect(mapStateToProps, mapDispatchToProps)(Editor);
export default EditorContainer;
