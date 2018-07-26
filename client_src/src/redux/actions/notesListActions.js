import notesListActionTypes from './constants/notesListActionConstants';

function changeActiveNodeAction({ id, path }) {
  if (typeof id !== 'string' || id.length === 0) {
    id = null;
  }
  if (!Array.isArray(path)) {
    path = [];
  }
  const activeNode = {
    id: id,
    path: path,
  };

  return {
    type: notesListActionTypes.SELECT_NODE,
    payload: {
      activeNode,
    },
  };
}

function navigateToNodeAction({ idx }) {
  return {
    type: notesListActionTypes.NAVIGATE_TO_NODE,
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

export { changeActiveNodeAction, navigateToNodeAction, changeNotesTreeAction, changeNodeTitleAction };

// TODO: validate arguments on action creators
