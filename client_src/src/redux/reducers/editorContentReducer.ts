import editorActionTypes from '../actions/constants/editorActionConstants';
import notesListActionTypes from '../actions/constants/notesListActionConstants';
import baseState from '../misc/initialState';

// Types
import { AnyAction } from 'redux';

const initialContent: EditorContentT = baseState.editorContent;

export default function editorContentReducer(state: EditorContentT = initialContent, action: AnyAction)
  : EditorContentT {
  if (!action.payload) {
    action.type = '';
  }
  console.log(`REDUCER: '${action.type}'`);
  switch (action.type) {
    case editorActionTypes.CONTENT_CHANGED:
      return {
        ...state,
        ...action.payload.newContent,
      };
    case editorActionTypes.NEW_EDITOR_CONTENT:
      return {
        ...state,
        ...action.payload.newEditorContent,
      };
    case editorActionTypes.FETCH_EDITOR_CONTENT_SUCCESS:
      return {
        ...state,
        ...action.payload.editorContent,
      };
    case notesListActionTypes.CHANGE_NODE_TITLE:
      // if the changed title belongs to the opened note
      if (action.payload.node && (state.id === action.payload.node.uniqid)) {
        if (state.title === action.payload.title) {
          return state;
        }

        return {
          ...state,
          title: action.payload.title,
          dateModified: action.payload.now,
        };
      } else {
        return state;
      }
    case editorActionTypes.REMOVE_NOTE_SUCCESS:
      if (Array.isArray(action.payload.ids) && action.payload.ids.includes(state.id)) {
        return {
          ...initialContent,
          readOnly: true,
        };
      } else {
        return state;
      }
    default:
      if (process.env.REACT_APP_DEBUG) {
        console.log(`Current editorContent: ${JSON.stringify(state)}`);
      }
      return state;
  }
}

export const selectId = (state: EditorContentT) => state.id;
