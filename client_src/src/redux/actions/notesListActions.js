import notesListActionTypes from './constants/notesListActionConstants';

function selectNodeAction({ id, path }) {
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
};

// TODO: validate arguments on action creators
