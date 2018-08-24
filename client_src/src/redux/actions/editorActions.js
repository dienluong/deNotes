import editorActionTypes from './constants/editorActionConstants';

function changeContentAction({ delta, content }) {
  return {
    type: editorActionTypes.CONTENT_CHANGED,
    payload: {
      newContent: {
        delta,
        content,
      },
    },
  };
}

export {
  changeContentAction,
};

// TODO: validate arguments on action creators
