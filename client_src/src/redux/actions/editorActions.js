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
      .then(fetched => {
        const editorContent = {
          id: fetched.id,
          title: fetched.title,
          content: fetched.content,
          delta: new Delta(fetched.delta),
          dateModified: fetched.dateModified,
          dateCreated: fetched.dateCreated,
          readOnly: false,
        };
        return dispatch({
          type: editorActionTypes.FETCH_EDITOR_CONTENT_SUCCESS,
          payload: { editorContent },
        });
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

/**
 *
 * @param ids {string[]}
 * @return {Function}
 */
export function removeNoteThunkAction({ ids }) {
  return (dispatch, getState) => {
    if (!Array.isArray(ids)) {
      const message = 'Invalid parameter. Expecting an array.';
      dispatch({
        type: editorActionTypes.REMOVE_NOTE_FAILURE,
        payload: { error: { message, ids } },
      });
      return Promise.reject(new Error(message));
    } else if (!ids.length) {
      const action = {
        type: editorActionTypes.REMOVE_NOTE_SUCCESS,
        payload: { ids, count: 0 },
      };
      // if ids is empty array, simply dispatch and return a Promise resolved to that action.
      return Promise.resolve(dispatch(action));
    }

    dispatch({
      type: editorActionTypes.REMOVING_NOTE,
      payload: { ids },
    });
    const userId = getState().userInfo.id;
    return removeContentFromStorage({ userId, ids })
      .then(result => {
        let count = 0;
        if (result && result.count) {
          count = result.count;
        }

        return dispatch({
          type: editorActionTypes.REMOVE_NOTE_SUCCESS,
          payload: { ids, count },
        });
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
