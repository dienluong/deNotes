import Delta from 'quill-delta';
import editorActionTypes from './constants/editorActionConstants';
import { load as loadEditorContent, remove as removeEditorContent } from '../../utils/editorContentStorage';

export function changeContentAction({ editor, content }) {
  return {
    type: editorActionTypes.CONTENT_CHANGED,
    payload: {
      newContent: {
        delta: editor.getContents(),
        content,
        dateModified: Date.now(),
      },
    },
  };
}

export function fetchEditorContentThunkAction({ noteId }) {
  return (dispatch) => {
    dispatch({
      type: editorActionTypes.FETCH_EDITOR_CONTENT,
      payload: { id: noteId },
    });
    // TODO: replace hardcoded noteId value
    // id = '45745c60-7b1a-11e8-9c9c-2d42b21b1a3e';
    return loadEditorContent({ id: noteId })
      .then(content => {
        if (content && 'body' in content && 'delta' in content) {
          // Note: the retrieved dates are date-time strings in ISO format; must convert to milliseconds since Unix epoch.
          const editorContent = {
            id: noteId,
            title: content.title,
            content: content.body,
            delta: new Delta(JSON.parse(content.delta)),
            dateModified: new Date(content.dateModified).getTime(),
            dateCreated: new Date(content.dateCreated).getTime(),
            readOnly: false,
          };
          return dispatch({
            type: editorActionTypes.FETCH_EDITOR_CONTENT_SUCCESS,
            payload: { editorContent },
          });
        } else {
          const message = `Note content fetch error: unrecognized data fetched. ID: ${noteId}`;
          dispatch({
            type: editorActionTypes.FETCH_EDITOR_CONTENT_FAILURE,
            payload: { error: { message, id: noteId } },
          });
          return Promise.reject(new Error(message));
        }
      })
      .catch(err => {
        const message = `Failed loading note content. ${err.message} ID: ${noteId}`;
        dispatch({
          type: editorActionTypes.FETCH_EDITOR_CONTENT_FAILURE,
          payload: { error: { message, id: noteId } },
        });
        return Promise.reject(new Error(message));
      });
  };
}

export function removeNoteThunkAction({ id }) {
  return (dispatch) => {
    dispatch({ type: editorActionTypes.REMOVING_NOTE, payload: { id } });
    return removeEditorContent({ id })
      .then(result => {
        if (result.count) {
          return dispatch({
            type: editorActionTypes.REMOVE_NOTE_SUCCESS,
            payload: { id, count: result.count },
          });
        } else {
          return Promise.reject(new Error('None deleted.'));
        }
      })
      .catch(err => {
        const message = `Failed deleting note. ${err.message} ID: ${id}`;
        dispatch({
          type: editorActionTypes.REMOVE_NOTE_FAILURE,
          payload: { error: { message, id } },
        });
        return Promise.reject(new Error(message));
      });
  };
}

// TODO: validate arguments on action creators
