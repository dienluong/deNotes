import Delta from 'quill-delta';
import editorActionTypes from './constants/editorActionConstants';
import * as editorContentStorage from '../../utils/editorContentStorage';

function changeContentAction({ delta, content }) {
  return {
    type: editorActionTypes.CONTENT_CHANGED,
    payload: {
      newContent: {
        delta,
        content,
      },
    },
  };
}

function fetchEditorContent({ id }) {
  return (dispatch) => {
    dispatch({
      type: editorActionTypes.FETCH_EDITOR_CONTENT,
      payload: { id },
    });
    // TODO: replace hardcoded noteId value
    id = '45745c60-7b1a-11e8-9c9c-2d42b21b1a3e';
    editorContentStorage.loadEditorContent({ id })
      .then(content => {
        if (content && 'body' in content && 'delta' in content) {
          const editorContent = {
            content: content.body,
            delta: new Delta(JSON.parse(content.delta)),
          };
          dispatch({
            type: editorActionTypes.FETCH_EDITOR_CONTENT_SUCCESS,
            payload: { editorContent },
          });
        } else {
          const error = 'Editor content fetch failed: unrecognized data fetched.';
          window.alert(error);// TODO: To adjust
          dispatch({
            type: editorActionTypes.FETCH_EDITOR_CONTENT_FAILED,
            payload: { error },
          });
        }
      })
      .catch(error => {
        window.alert(`No saved data loaded. ${error.message}`);// TODO: To adjust
        dispatch({
          type: editorActionTypes.FETCH_EDITOR_CONTENT_FAILED,
          payload: {
            error,
          },
        });
      });
  };
}
export {
  changeContentAction,
  fetchEditorContent,
};

// TODO: validate arguments on action creators
