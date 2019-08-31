import { connect } from 'react-redux';
import Editor from './widgets/Editor';
import { changeContentAction } from '../redux/actions/editorActions';

// Types
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { Delta, Sources, BoundsStatic, RangeStatic, DeltaStatic } from 'quill';
interface UnprivilegedEditor {
  getLength(): number;
  getText(index?: number, length?: number): string;
  getHTML(): string;
  getBounds(index: number, length?: number): BoundsStatic;
  getSelection(focus?: boolean): RangeStatic;
  getContents(index?: number, length?: number): DeltaStatic;
}
interface DispatchProps {
  contentChangeHandler: (content: string, delta: Delta, source: Sources, editor: UnprivilegedEditor) => AnyAction;
}

function mapStateToProps(state: AppStateT) {
  return {
    id: state.editorContent.id,
    title: state.editorContent.title,
    delta: state.editorContent.delta,
    content: state.editorContent.content,
    dateCreated: state.editorContent.dateCreated,
    dateModified: state.editorContent.dateModified,
    readOnly: state.editorContent.readOnly,
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch<AppStateT, any, AnyAction> ): DispatchProps {
  return {
    contentChangeHandler(content, delta, source, editor) {
      return dispatch(changeContentAction({ editor, content }));
    },
  };
}

// Note: ownProps is automatically forwarded to the wrapped component
const EditorContainer = connect(mapStateToProps, mapDispatchToProps)(Editor);
export default EditorContainer;
