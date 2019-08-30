import Delta from 'quill-delta';
import editorActionTypes from './constants/editorActionConstants';
import * as rootReducer from '../reducers';

// Types
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { BoundsStatic, RangeStatic, DeltaStatic } from 'quill';
interface UnprivilegedEditor {
  getLength(): number;
  getText(index?: number, length?: number): string;
  getHTML(): string;
  getBounds(index: number, length?: number): BoundsStatic;
  getSelection(focus?: boolean): RangeStatic;
  getContents(index?: number, length?: number): DeltaStatic;
}

// TODO: Remove
// import { load as loadContentFromStorage, remove as removeContentFromStorage } from '../../utils/editorContentStorage';

let _editorContentStorage: StorageT = {
  save: () => Promise.reject(new Error('Not implemented.')),
  load: () => Promise.reject(new Error('Not implemented.')),
  remove: () => Promise.reject(new Error('Not implemented.')),
};

export function use({ editorContentStorage }: { editorContentStorage: StorageT })
  : void {
  // const methods = ['save', 'load', 'remove'];
  // if (editorContentStorage && typeof editorContentStorage === 'object') {
  //   methods.forEach(m => {
  //     if (typeof editorContentStorage[m] === 'function') {
  //       _editorContentStorage[m] = editorContentStorage[m];
  //     }
  //   });
  // }
  Object.keys(editorContentStorage).forEach(m => {
    // @ts-ignore
    _editorContentStorage[m] = editorContentStorage[m];
  });
}

/**
 * @param editorContent
 */
export function newContentAction({ editorContent }: { editorContent: EditorContentT })
  : AnyAction {
  return {
    type: editorActionTypes.NEW_EDITOR_CONTENT,
    payload: {
      newEditorContent: editorContent,
    },
  };
}

/**
 * @param editor
 * @param content
 * @return {{type: string, payload: {newContent: {delta: Delta, content: *, dateModified: number}}}}
 */
export function changeContentAction({ editor, content }: { editor: UnprivilegedEditor, content: string })
  : AnyAction {
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

/**
 * @param noteId
 * @return {function(*, *): Promise<T | never>}
 */
export function fetchEditorContentThunkAction({ noteId }: { noteId: string })
  : ThunkAction<Promise<AnyAction>, AppStateT, any, AnyAction> {
  return (dispatch, getState) => {
    const userId = rootReducer.selectUserInfoId(getState());
    dispatch({
      type: editorActionTypes.FETCH_EDITOR_CONTENT,
      payload: { id: noteId },
    });
    // TODO: replace hardcoded noteId value
    // id = '45745c60-7b1a-11e8-9c9c-2d42b21b1a3e';
    return _editorContentStorage.load({ userId, id: noteId })
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
        const action = {
          type: editorActionTypes.FETCH_EDITOR_CONTENT_FAILURE,
          payload: { error: { message, id: noteId } },
        };
        dispatch(action);
        const error = new Error(message);
        (error as ActionError).action = action;
        return Promise.reject(error);
      });
  };
}

/**
 *
 * @param {Object} params
 * @param {string[]} params.ids
 * @return {ThunkAction}
 */
export function removeNoteThunkAction({ ids }: { ids: string[] })
  : ThunkAction<Promise<AnyAction>, AppStateT, any, AnyAction> {
  return (dispatch, getState) => {
    if (!Array.isArray(ids)) {
      const message = 'Invalid parameter. Expecting an array.';
      const action = {
        type: editorActionTypes.REMOVE_NOTE_FAILURE,
        payload: { error: { message, ids } },
      };
      dispatch(action);
      const error = new Error(message);
      (error as ActionError).action = action;
      return Promise.reject(error);
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
    const userId = rootReducer.selectUserInfoId(getState());
    return _editorContentStorage.remove({ userId, ids })
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
        const action = {
          type: editorActionTypes.REMOVE_NOTE_FAILURE,
          payload: { error: { message, ids } },
        };
        dispatch(action);
        const error = new Error(message);
        (error as ActionError).action = action;
        return Promise.reject(error);
      });
  };
}

// TODO: validate arguments on action creators
