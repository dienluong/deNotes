import Delta from 'quill-delta';
import editorActionTypes from './constants/editorActionConstants';
import * as editorContentStorage from '../../utils/editorContentStorage';

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

function fetchEditorContentAction({ noteId }) {
  return (dispatch) => {
    dispatch({
      type: editorActionTypes.FETCH_EDITOR_CONTENT,
      payload: { id: noteId },
    });
    // TODO: replace hardcoded noteId value
    // id = '45745c60-7b1a-11e8-9c9c-2d42b21b1a3e';
    return editorContentStorage.load({ id: noteId })
      .then(content => {
        if (content && 'body' in content && 'delta' in content) {
          const editorContent = {
            id: noteId,
            content: content.body,
            delta: new Delta(JSON.parse(content.delta)),
          };
          return dispatch({
            type: editorActionTypes.FETCH_EDITOR_CONTENT_SUCCESS,
            payload: { editorContent },
          });
        } else {
          const message = `Note content fetch error: unrecognized data fetched. ID: ${noteId}`;
          dispatch({
            type: editorActionTypes.FETCH_EDITOR_CONTENT_FAILED,
            payload: { error: { message, id: noteId } },
          });
          return Promise.reject(new Error(message));
        }
      })
      .catch(err => {
        const message = `No note content loaded. ${err.message} ID: ${noteId}`;
        dispatch({
          type: editorActionTypes.FETCH_EDITOR_CONTENT_FAILED,
          payload: { error: { message, id: noteId } },
        });
        return Promise.reject(new Error(message));
      });
  };
}

export {
  changeContentAction,
  fetchEditorContentAction,
};

// TODO: validate arguments on action creators
