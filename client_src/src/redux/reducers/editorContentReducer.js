import editorActionTypes from '../actions/constants/editorActionConstants';
import baseState from '../misc/initialState';

const initialContent = baseState.editorContent;

export default function editorContentReducer(state = initialContent, action) {
  switch (action.type) {
    case editorActionTypes.CONTENT_CHANGED:
      console.log(`REDUCER: ${editorActionTypes.CONTENT_CHANGED}`);
      return {
        content: action.payload.newContent.content,
        delta: state.delta.concat(action.payload.newContent.delta),
      };
    case editorActionTypes.FETCH_EDITOR_CONTENT_SUCCESS:
      console.log(`REDUCER: ${editorActionTypes.FETCH_EDITOR_CONTENT_SUCCESS}`);
      return action.payload.editorContent;
    default:
      console.log(`Initial editorContent: ${JSON.stringify(state)}`);
      return state;
  }
}
