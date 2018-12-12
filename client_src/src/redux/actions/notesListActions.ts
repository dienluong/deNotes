import uuid from 'uuid/v4';
import notesListActionTypes from './constants/notesListActionConstants';
import { fetchEditorContentThunkAction, removeNoteThunkAction } from './editorActions';
import { translateNodeIdToInfo, getDescendantItems } from '../../utils/treeUtils';
import baseState from '../misc/initialState';

// Types
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
type StorageMethodNames = 'save' | 'load' | 'remove';
type StorageMethodSignature = (params: object) => Promise<any>;
type StorageT = {
  [key in StorageMethodNames]: StorageMethodSignature;
}

// TODO: remove
// import { save as saveEditorContent } from '../../reactive/editorContentObserver';
// import { load as loadNotesTreeFromStorage } from '../../utils/notesTreeStorage';

let _notesTreeStorage: StorageT = {
  save: () => Promise.reject(new Error('Not implemented.')),
  load: () => Promise.reject(new Error('Not implemented.')),
  remove: () => Promise.reject(new Error('Not implemented')),
};

let _editorContentStorage: StorageT = {
  save: () => Promise.reject(new Error('Not implemented.')),
  load: () => Promise.reject(new Error('Not implemented.')),
  remove: () => Promise.reject(new Error('Not implemented')),
};

/**
 *
 * @param {Object} storage
 * @param {Object} [storage.notesTreeStorage]
 * @param {Object} [storage.editorContentStorage]
 */
export function use({ notesTreeStorage, editorContentStorage }: { notesTreeStorage?: StorageT, editorContentStorage?: StorageT })
  : void {
  // const methods = ['save', 'load', 'remove'];
  // if (notesTreeStorage && typeof notesTreeStorage === 'object') {
  //   methods.forEach(m => {
  //     if (typeof notesTreeStorage[m] === 'function') {
  //       _notesTreeStorage[m] = notesTreeStorage[m];
  //     }
  //   });
  // }
  // if (editorContentStorage && typeof editorContentStorage === 'object') {
  //   methods.forEach(m => {
  //     if (typeof editorContentStorage[m] === 'function') {
  //       _editorContentStorage[m] = editorContentStorage[m];
  //     }
  //   });
  // }

  if (notesTreeStorage) {
    Object.keys(notesTreeStorage).forEach(m => {
      // @ts-ignore
      _notesTreeStorage[m] = notesTreeStorage[m];
    });
  }
  if (editorContentStorage) {
    Object.keys(editorContentStorage).forEach(m => {
      // @ts-ignore
      _editorContentStorage[m] = editorContentStorage[m];
    });
  }
}

/**
 *
 * @param {Object} params
 * @param {string} params.id
 * @param {string[]} params.path
 */
export function selectNodeThunkAction({ id, path }: { id: string, path: Array<string> })
  : ThunkAction<Promise<AnyAction>, AppStateT, any, AnyAction> {
  return (dispatch, getState) => {
    // if (typeof id !== 'string' || !id.length) {
    if (!id.length) {
      id = getState().activeNode.id;
    }
    if (!Array.isArray(path) || !path.length) {
      path = getState().activeNode.path;
    }
    // dispatch actions only if selected node actually changed
    if (getState().activeNode.id !== id) {
      const activeNode = { id, path };

      // Immediately save currently opened note
      const currentContent = getState().editorContent;
      if (currentContent.id) {
        _editorContentStorage.save(currentContent)
          .catch((err: Error) => { console.log(err); }); // TODO: log error?
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
            .catch((err: ActionError) => {
              window.alert(`Error loading saved note content: ${err.message}`);
              return err.action;
            }); // TODO: adjust error handling.
        }
      }
      return Promise.resolve(returnVal);
    } else {
      return Promise.resolve({ type: 'NO_OP' });
    }
  };
}

/**
 *
 * @param {Object} params
 * @param {Object} params.node
 * @param {string[]} params.path
 */
export function deleteNodeThunkAction({ node, path }: { node: TreeNodeT, path: Array<string> })
  : ThunkAction<Promise<AnyAction>, AppStateT, any, AnyAction> {
  return (dispatch) => {
    let itemIds: Array<string> = [];

    // Collect the uniqid of all items to delete.
    if (node.type === 'item') {
      itemIds = [node.uniqid];
    } else if (node.type === 'folder') {
      if (node.children && node.children.length) {
        itemIds = getDescendantItems({ node }).map(node => node.uniqid);
      }
    }

    // dispatch action to delete note(s) from storage
    return dispatch(removeNoteThunkAction({ ids: itemIds }))
      .then((action: AnyAction) => {
        console.log(`Number of notes deleted: ${action.payload.count}`); // TODO: remove
        // if delete from storage succeeded, then delete node from tree
        dispatch({
          type: notesListActionTypes.DELETE_NODE,
          payload: { node, path },
        });
        // then determine if the active node must change.
        return dispatch(switchActiveNodeOnDeleteAction({ id: node.id, path }));
      })
      .catch((err: ActionError) => {
        window.alert(`ERROR deleting saved note: ${err.message}`);
        return err.action;
      });
  };
}

/**
 * @param {Object} params
 * @param {string} params.id
 * @param {string[]} params.path
 */
export function switchActiveNodeOnDeleteAction({ id, path }: { id: string, path: Array<string> })
  : AnyAction {
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

/**
 *
 * @param {Object} params
 * @param {string} params.kind
 * @param {string[]} params.path
 */
export function addAndSelectNodeThunkAction({ kind, path }: { kind: string, path?: Array<string> })
  : ThunkAction<AnyAction, AppStateT, any, AnyAction> {
  return (dispatch, getState) => {
    // Immediately save currently opened note
    const currentContent = getState().editorContent;
    if (currentContent.id) {
      _editorContentStorage.save(currentContent)
        .catch((err: Error) => console.log(err)); // TODO: log error?
    }

    return dispatch({
      type: notesListActionTypes.ADD_AND_SELECT_NODE,
      payload: {
        kind,
        path,
      },
    });
  };
}

/**
 * return {ThunkAction}
 */
export function fetchNotesTreeThunkAction()
  : ThunkAction<Promise<(AnyAction | Error)>, AppStateT, any, AnyAction> {
  return (dispatch, getState) => {
    const userId = getState().userInfo.id;
    dispatch({
      type: notesListActionTypes.FETCH_NOTES_TREE,
      payload: { userId },
    });

    return _notesTreeStorage.load({ userId })
      .then(notesTree => {
        if (Array.isArray(notesTree.tree)) {
          const activeNode = { id: notesTree.tree[0].id, path: [notesTree.tree[0].id] };// TODO: adjust activeNode to where user left off
          const returnVal = dispatch({
            type: notesListActionTypes.FETCH_NOTES_TREE_SUCCESS,
            payload: {
              notesTree,
            },
          });
          dispatch({
            type: notesListActionTypes.CHANGE_NOTES_TREE,
            payload: {
              notesTree,
            },
          });
          dispatch({
            type: notesListActionTypes.SELECT_NODE,
            payload: {
              activeNode,
            },
          });

          return Promise.resolve(returnVal);
        } else {
          const error = new Error('Unrecognized data fetched.');
          return Promise.reject(error);
        }
      })
      .catch((err: Error) => {
        // If no tree found for this user, use default tree from initial state and add new node (new blank note)
        const error = new Error(`No tree loaded. Error: ${err.message} Using default tree.`);
        // TODO: Remove
        console.log(error);
        dispatch({
          type: notesListActionTypes.FETCH_NOTES_TREE_FAILURE,
          payload: { error },
        });
        const now = Date.now();
        dispatch({
          type: notesListActionTypes.CHANGE_NOTES_TREE,
          payload: {
            notesTree: {
              ...baseState.notesTree,
              id: uuid(),
              dateCreated: now,
              dateModified: now,
            },
          },
        });
        // Add a "note" node (an item) to the root of the tree
        return dispatch(addAndSelectNodeThunkAction({ kind: 'item', path: [baseState.notesTree.tree[0].id] }));
      });
  };
}

/**
 * @param {Object} params
 * @param {number} params.idx
 */
export function navigatePathAction({ idx }: { idx: number })
  : AnyAction {
  return {
    type: notesListActionTypes.NAVIGATE_PATH,
    payload: {
      idx,
    },
  };
}

/**
 * @param {Object} params
 * @param {TreeNodeT[]} params.tree
 */
export function changeNotesTreeAction({ tree }: { tree: Array<TreeNodeT> })
  : AnyAction {
  const notesTree: { tree?: Array<TreeNodeT> } = {};
  if (Array.isArray(tree)) {
    notesTree.tree = tree;
  } else {
    notesTree.tree = baseState.notesTree.tree;
  }

  return {
    type: notesListActionTypes.CHANGE_NOTES_TREE,
    payload: {
      notesTree,
    },
  };
}

/**
 *
 * @param {Object} params
 * @param {string} params.title
 * @param {TreeNodeT} params.node
 * @param {string[]>} params.path
 */
export function changeNodeTitleAction({ title, node, path }: { title: string, node: TreeNodeT, path: Array<string> })
  : AnyAction {
  return {
    type: notesListActionTypes.CHANGE_NODE_TITLE,
    payload: {
      title,
      node,
      path,
    },
  };
}
