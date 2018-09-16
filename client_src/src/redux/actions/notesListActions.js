import notesListActionTypes from './constants/notesListActionConstants';
import { fetchEditorContentThunkAction, removeNoteThunkAction } from './editorActions';
import { translateNodeIdToInfo } from '../../utils/treeUtils';
import { save as saveEditorContent } from '../../reactive/editorContentObserver';
import { load as loadNotesTree } from '../../utils/notesTreeStorage';
import baseState from '../misc/initialState';

export function selectNodeThunkAction({ id, path }) {
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

      // Immediately save currenly opened note
      const currentContent = getState().editorContent;
      if (currentContent.id) {
        saveEditorContent(currentContent);
      }

      const returnVal = dispatch({
        type: notesListActionTypes.SELECT_NODE,
        payload: {
          activeNode,
        },
      });

      // Fetch saved note only if:
      // 1) newly selected node represents a note ('item'), as opposed to a folder.
      // 2) newly selected node is not the already opened note
      const kind = translateNodeIdToInfo({ nodeId: activeNode.id, kind: 'type' });
      if (kind === 'item') {
        const uniqid = translateNodeIdToInfo({ nodeId: activeNode.id, kind: 'uniqid' });
        if (uniqid !== getState().editorContent.id) {
          return dispatch(fetchEditorContentThunkAction({ noteId: uniqid }))
            .catch(err => window.alert(`Error loading saved note content: ${err.message}`)); // TODO: adjust error handling.
        }
      }
      return Promise.resolve(returnVal);
    } else {
      return Promise.resolve({ type: 'NO_OP', payload: {} });
    }
  };
}

export function switchActiveNodeOnDeleteAction({ id, path }) {
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

export function navigatePathAction({ idx }) {
  return {
    type: notesListActionTypes.NAVIGATE_PATH,
    payload: {
      idx,
    },
  };
}

export function changeNotesTreeAction({ tree, dateCreated, dateModified }) {
  const notesTree = {};
  if (Array.isArray(tree)) {
    notesTree.tree = tree;
  }

  if (dateCreated) {
    notesTree.dateCreated = dateCreated;
  }

  if (dateModified) {
    notesTree.dateModified = dateModified;
  }

  return {
    type: notesListActionTypes.CHANGE_NOTES_TREE,
    payload: {
      notesTree,
    },
  };
}

export function changeNodeTitleAction({ title, node, path }) {
  return {
    type: notesListActionTypes.CHANGE_NODE_TITLE,
    payload: {
      title,
      node,
      path,
    },
  };
}

export function deleteNodeThunkAction({ node, path }) {
  return (dispatch) => {
    if (node.type === 'item') {
      // dispatch action to delete note from storage
      return dispatch(removeNoteThunkAction({ id: node.uniqid }))
        .then((action) => {
          console.log(`Number of notes deleted: ${action.payload.count}`); // TODO: remove
          // if delete from storage succeeded, delete node from tree
          dispatch({
            type: notesListActionTypes.DELETE_NODE,
            payload: { node, path },
          });
          // then determine if the active node must change.
          return dispatch(switchActiveNodeOnDeleteAction({ id: node.id, path }));
        })
        .catch((err) => window.alert(`ERROR deleting saved note: ${err.message}`));
    } else {
      dispatch({
        type: notesListActionTypes.DELETE_NODE,
        payload: { node, path },
      });
      return Promise.resolve(dispatch(switchActiveNodeOnDeleteAction({ id: node.id, path })));
    }
  };
}

export function addAndSelectNodeAction({ kind, path }) {
  return {
    type: notesListActionTypes.ADD_AND_SELECT_NODE,
    payload: {
      kind,
      path,
    },
  };
}

export function fetchNotesTreeThunkAction({ userId }) {
  return (dispatch) => {
    dispatch({
      type: notesListActionTypes.FETCH_NOTES_TREE,
      payload: { userId },
    });
    return loadNotesTree({ userId })
      .then(notesTree => {
        if (notesTree && notesTree.tree) {
          if (Array.isArray(notesTree.tree)) {
            const activeNode = { id: notesTree.tree[0].id, path: [notesTree.tree[0].id] };// TODO: adjust activeNode to where user left off
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
              type: notesListActionTypes.FETCH_NOTES_TREE_FAILURE,
              payload: { error, data: notesTree.tree },
            });
            return Promise.reject(new Error(error));
          }
        } else {
          // If no tree found for this user, use default tree from initial state and add new node (new blank note)
          const now = Date.now();
          dispatch(changeNotesTreeAction({
            ...baseState.notesTree,
            dateCreated: now,
            dateModified: now,
          }));
          return dispatch(addAndSelectNodeAction({ kind: 'item' }));
        }
      })
      .catch(err => {
        const error = `No notes list loaded. ${err.message}`;
        dispatch({
          type: notesListActionTypes.FETCH_NOTES_TREE_FAILURE,
          payload: { error },
        });
        return Promise.reject(new Error(error));
      });
  };
}

// TODO: validate arguments on action creators
