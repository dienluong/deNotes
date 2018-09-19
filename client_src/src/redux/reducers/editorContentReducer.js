import editorActionTypes from '../actions/constants/editorActionConstants';
import notesListActionTypes from '../actions/constants/notesListActionConstants';
import baseState from '../misc/initialState';

const initialContent = baseState.editorContent;

export default function editorContentReducer(state = initialContent, action) {
  console.log(`REDUCER: ${action.type}`);
  switch (action.type) {
    case editorActionTypes.CONTENT_CHANGED:
      return {
        ...state,
        ...action.payload.newContent,
      };
    case editorActionTypes.FETCH_EDITOR_CONTENT_SUCCESS:
      return {
        ...state,
        ...action.payload.editorContent,
      };
    case notesListActionTypes.CHANGE_NODE_TITLE:
      // if the changed title belongs to the opened note
      if (state.id === action.payload.node.uniqid) {
        return {
          ...state,
          title: action.payload.title,
          dateModified: Date.now(),
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
