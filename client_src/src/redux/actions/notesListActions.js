import notesListActionTypes from './constants/notesListActionConstants';
import { fetchEditorContentThunkAction } from './editorActions';
import { translateNodeIdToInfo } from '../../utils/treeUtils';
import * as notesTreeStorage from '../../utils/notesTreeStorage';

function selectNodeAction({ id, path }) {
  let activeNode = null;
  if (typeof id !== 'string' || id.length === 0) {
    id = '';
  }
  if (!Array.isArray(path)) {
    path = [];
  }

  return (dispatch, getState) => {
    // dispatch actions only if selected node actually changed
    if (getState().activeNode && getState().activeNode.id !== id) {
      activeNode = { id, path };

      dispatch({
        type: notesListActionTypes.SELECT_NODE,
        payload: {
          activeNode,
        },
      });

      const uniqid = translateNodeIdToInfo({ nodeId: activeNode.id, kind: 'uniqid' });
      // If newly selected node is not the already opened note
      if (getState().editorContent.id !== uniqid) {
        // Fetch note only if newly selected node represents a note, as opposed to a folder.
        if (translateNodeIdToInfo({ nodeId: activeNode.id, kind: 'type' }) === 'item') {
          dispatch(fetchEditorContentThunkAction({ noteId: uniqid }))
            .catch(err => window.alert(err.message));
        }
      }
    } else {
      return {
        type: 'NO_OP',
        payload: {},
      };
    }
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

function addAndSelectNodeAction({ kind, path }) {
  return {
    type: notesListActionTypes.ADD_AND_SELECT_NODE,
    payload: {
      kind,
      path,
    },
  };
}

function fetchNotesTreeThunkAction({ userId }) {
  return (dispatch) => {
    dispatch({
      type: notesListActionTypes.FETCH_NOTES_TREE,
      payload: { userId },
    });
    return notesTreeStorage.load({ userId })
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
  navigatePathAction,
  changeNotesTreeAction,
  changeNodeTitleAction,
  deleteNodeAction,
  addAndSelectNodeAction,
  fetchNotesTreeThunkAction,
};

// TODO: validate arguments on action creators
