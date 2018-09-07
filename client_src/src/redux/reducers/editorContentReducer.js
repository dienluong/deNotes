import editorActionTypes from '../actions/constants/editorActionConstants';
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
    default:
      if (process.env.REACT_APP_DEBUG) {
        console.log(`Current editorContent: ${JSON.stringify(state)}`);
      }
      return state;
  }
}
