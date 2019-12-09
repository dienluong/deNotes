import { connect } from 'react-redux';
import Editor from './widgets/Editor';
import { changeContentAction } from '../redux/actions/editorActions';
import * as rootReducer from '../redux/reducers';

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
    id: rootReducer.selectEditorContentId(state),
    title: rootReducer.selectEditorContentTitle(state),
    delta: rootReducer.selectEditorContentDelta(state),
    content: rootReducer.selectEditorContentContent(state),
    dateCreated: rootReducer.selectEditorContentDateCreated(state),
    dateModified: rootReducer.selectEditorContentDateModified(state),
    readOnly: rootReducer.selectEditorContentReadOnly(state),
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
