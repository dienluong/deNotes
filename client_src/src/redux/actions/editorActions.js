import Delta from 'quill-delta';
import editorActionTypes from './constants/editorActionConstants';

function changeContentAction({ editor, content }) {
  return {
    type: editorActionTypes.CONTENT_CHANGED,
    payload: {
      newContent: {
        delta: editor.getContents(),
        content,
      },
    },
  };
}

function fetchEditorContent({ id, storage }) {
  return (dispatch) => {
    dispatch({
      type: editorActionTypes.FETCH_EDITOR_CONTENT,
      payload: { id },
    });
    // TODO: replace hardcoded noteId value
    id = '45745c60-7b1a-11e8-9c9c-2d42b21b1a3e';
    return storage.load({ id })
      .then(content => {
        if (content && 'body' in content && 'delta' in content) {
          const editorContent = {
            content: content.body,
            delta: new Delta(JSON.parse(content.delta)),
          };
          return dispatch({
            type: editorActionTypes.FETCH_EDITOR_CONTENT_SUCCESS,
            payload: { editorContent },
          });
        } else {
          const error = 'Note content fetch error: unrecognized data fetched.';
          dispatch({
            type: editorActionTypes.FETCH_EDITOR_CONTENT_FAILED,
            payload: { error },
          });
          return Promise.reject(new Error(error));
        }
      })
      .catch(err => {
        const error = `No note content loaded. ${err.message}`;
        dispatch({
          type: editorActionTypes.FETCH_EDITOR_CONTENT_FAILED,
          payload: { error },
        });
        return Promise.reject(new Error(error));
      });
  };
}

export {
  changeContentAction,
  fetchEditorContent,
};

// TODO: validate arguments on action creators
