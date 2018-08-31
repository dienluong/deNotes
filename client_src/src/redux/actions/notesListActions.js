import notesListActionTypes from './constants/notesListActionConstants';

function selectNodeAction({ id, path }) {
  if (typeof id !== 'string' || id.length === 0) {
    id = null;
  }
  if (!Array.isArray(path)) {
    path = [];
  }
  const activeNode = {
    id,
    path,
  };

  return {
    type: notesListActionTypes.SELECT_NODE,
    payload: {
      activeNode,
    },
  };
}

function switchActiveNodeOnDeleteAction({ id, path }) {
  return {
    type: notesListActionTypes.SWITCH_NODE_ON_DELETE,
    payload: {
      deletedNode: {
        id,
        path,
      },
    },
  };
}

function switchActiveNodeOnAddAction({ path }) {
  return {
    type: notesListActionTypes.SWITCH_NODE_ON_ADD,
    payload: {
      path,
    },
  };
}

function navigatePathAction({ idx }) {
  return {
    type: notesListActionTypes.NAVIGATE_PATH,
    payload: {
      idx,
    },
  };
}

function changeNotesTreeAction(notesTree) {
  if (!Array.isArray(notesTree)) {
    notesTree = [];
  }

  return {
    type: notesListActionTypes.CHANGE_NOTES_TREE,
    payload: {
      notesTree,
    },
  };
}

function changeNodeTitleAction({ title, node, path }) {
  return {
    type: notesListActionTypes.CHANGE_NODE_TITLE,
    payload: {
      title,
      node,
      path,
    },
  };
}

function deleteNodeAction({ node, path }) {
  return {
    type: notesListActionTypes.DELETE_NODE,
    payload: {
      node,
      path,
    },
  };
}

function addNoteAction({ path }) {
  return {
    type: notesListActionTypes.ADD_NOTE,
    payload: {
      path,
    },
  };
}

function addAndSelectNodeAction({ kind }) {
  return {
    type: notesListActionTypes.ADD_AND_SELECT_NODE,
    payload: {
      kind,
    },
  };
}

function fetchNotesTreeAction({ userId, storage }) {
  return (dispatch) => {
    dispatch({
      type: notesListActionTypes.FETCH_NOTES_TREE,
      payload: { userId },
    });
    return storage.load({ userId })
      .then(treesArray => {
        if (Array.isArray(treesArray) && treesArray.length) {
          // In the unexpected case where there are more than one tree for the same user, use the last one.
          const notesTree = JSON.parse(treesArray[treesArray.length - 1].jsonStr);
          const activeNode = { id: notesTree[0].id, path: [notesTree[0].id] };// TODO: adjust activeNode to where user left off
          return dispatch({
            type: notesListActionTypes.FETCH_NOTES_TREE_SUCCESS,
            payload: {
              notesTree,
              activeNode, // TODO: not sure if it is okay to set activeNode in a notesList action.
            },
          });
        } else {
          const error = 'Notes list fetch error: unrecognized data fetched.';
          dispatch({
            type: notesListActionTypes.FETCH_NOTES_TREE_FAILED,
            payload: { error },
          });
          return Promise.reject(new Error(error));
        }
      })
      .catch(err => {
        const error = `No notes list loaded. ${err.message}`;
        dispatch({
          type: notesListActionTypes.FETCH_NOTES_TREE_FAILED,
          payload: { error },
        });
        return Promise.reject(new Error(error));
      });
  };
}

export {
  selectNodeAction,
  switchActiveNodeOnDeleteAction,
  switchActiveNodeOnAddAction,
  navigatePathAction,
  changeNotesTreeAction,
  changeNodeTitleAction,
  deleteNodeAction,
  addNoteAction,
  addAndSelectNodeAction,
  fetchNotesTreeAction,
};

// TODO: validate arguments on action creators
