import Delta from 'quill-delta';
import editorActionTypes from './constants/editorActionConstants';
import { load as loadContentFromStorage, remove as removeContentFromStorage } from '../../utils/editorContentStorage';

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
  return (dispatch, getState) => {
    const userId = getState().userInfo.id;
    dispatch({
      type: editorActionTypes.FETCH_EDITOR_CONTENT,
      payload: { id: noteId },
    });
    // TODO: replace hardcoded noteId value
    // id = '45745c60-7b1a-11e8-9c9c-2d42b21b1a3e';
    return loadContentFromStorage({ userId, id: noteId })
      .then(content => {
        if (content && 'body' in content && 'delta' in content) {
          // Note: the retrieved dates are date-time strings in ISO format; must convert to milliseconds since Unix epoch.
          const editorContent = {
            id: noteId,
            title: content.title,
            content: content.body,
            delta: typeof content.delta === 'string' ? new Delta(JSON.parse(content.delta)) : new Delta(content.delta),
            dateModified: new Date(content.dateModified).getTime(),
            dateCreated: new Date(content.dateCreated).getTime(),
            readOnly: false,
          };
          return dispatch({
            type: editorActionTypes.FETCH_EDITOR_CONTENT_SUCCESS,
            payload: { editorContent },
          });
        } else {
          const message = `Unrecognized data fetched. ID: ${noteId}`;
          return Promise.reject(new Error(message));
        }
      })
      .catch(err => {
        const message = `${err.message} ID: ${noteId}`;
        dispatch({
          type: editorActionTypes.FETCH_EDITOR_CONTENT_FAILURE,
          payload: { error: { message, id: noteId } },
        });
        return Promise.reject(new Error(message));
      });
  };
}

export function removeNoteThunkAction({ ids }) {
  return (dispatch, getState) => {
    if (!Array.isArray(ids)) {
      return Promise.reject(new Error('Invalid parameter.'));
    } else if (!ids.length) {
      // if ids is empty array, simply return a Promise resolved to an action.
      return Promise.resolve({
        type: '',
        payload: { count: 0 },
      });
    }

    dispatch({ type: editorActionTypes.REMOVING_NOTE, payload: { ids } });
    const userId = getState().userInfo.id;
    return removeContentFromStorage({ userId, ids })
      .then(result => {
        if (result.count) {
          return dispatch({
            type: editorActionTypes.REMOVE_NOTE_SUCCESS,
            payload: { ids, count: result.count },
          });
        } else {
          return Promise.reject(new Error('None deleted.'));
        }
      })
      .catch(err => {
        const message = `Failed deleting note(s). ${err.message} ID: ${ids}`;
        dispatch({
          type: editorActionTypes.REMOVE_NOTE_FAILURE,
          payload: { error: { message, ids } },
        });
        return Promise.reject(new Error(message));
      });
  };
}

// TODO: validate arguments on action creators
