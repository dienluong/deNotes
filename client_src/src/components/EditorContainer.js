import { connect } from 'react-redux';
import Editor from './widgets/Editor';
import { changeContentAction } from '../redux/actions/editorActions';

// function mapStateToProps(state) {
//   return {
//     delta: state.editor.delta,
//     content: state.editor.content,
//   };
// }

function mapDispatchToProps(dispatch) {
  return {
    contentChangeHandler(content, delta, source, editor) {
      return dispatch(changeContentAction({ delta, content }));
    },
  };
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, ownProps, dispatchProps);
}

const EditorContainer = connect(null, mapDispatchToProps, mergeProps)(Editor);
export default EditorContainer;
