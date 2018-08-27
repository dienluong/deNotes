import editorActionTypes from '../actions/constants/editorActionConstants';
import Delta from 'quill-delta';

const initialContent = {
  content: '',
  delta: new Delta(),
};

export default function editorContentReducer(state = initialContent, action) {
  switch (action.type) {
    case editorActionTypes.CONTENT_CHANGED:
      console.log(`REDUCER: ${editorActionTypes.CONTENT_CHANGED}`);
      const newD = state.delta.concat(action.payload.newContent.delta);
      // TODO: Remove
      console.log(newD);
      return {
        content: action.payload.newContent.content,
        delta: newD,
      };
    default:
      console.log(`Initial editorContent: ${JSON.stringify(state, null, 4)}`);
      return state;
  }
}
