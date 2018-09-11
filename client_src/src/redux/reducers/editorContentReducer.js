import editorActionTypes from '../actions/constants/editorActionConstants';
import notesListActionTypes from '../actions/constants/notesListActionConstants';
import baseState from '../misc/initialState';

const initialContent = baseState.editorContent;

export default function editorContentReducer(state = initialContent, action) {
  switch (action.type) {
    case editorActionTypes.CONTENT_CHANGED:
      console.log(`REDUCER: ${editorActionTypes.CONTENT_CHANGED}`);
      return {
        ...state,
        ...action.payload.newContent,
      };
    case editorActionTypes.FETCH_EDITOR_CONTENT_SUCCESS:
      console.log(`REDUCER: ${editorActionTypes.FETCH_EDITOR_CONTENT_SUCCESS}`);
      return {
        ...state,
        ...action.payload.editorContent,
      };
    case notesListActionTypes.CHANGE_NODE_TITLE:
      console.log(`REDUCER: ${notesListActionTypes.CHANGE_NODE_TITLE}`);
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
      console.log(`REDUCER: ${editorActionTypes.REMOVE_NOTE_SUCCESS}`);
      if (state.id === action.payload.id) {
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
