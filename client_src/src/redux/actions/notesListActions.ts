import uuid from 'uuid/v4';
import notesListActionTypes from './constants/notesListActionConstants';
import { fetchEditorContentThunkAction, removeNoteThunkAction } from './editorActions';
import { translateNodeIdToInfo, getDescendantItems } from '../../utils/treeUtils';
import { selectSiblingsOfActiveNode } from '../selectors';

// Types
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

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
 * ...
 * @param {Object} params
 * @param {string} params.id
 * @param {string[]} [params.path]
 */
export function selectNodeThunkAction({ id, path }: { id: string, path?: string[] })
  : ThunkAction<AnyAction, AppStateT, any, AnyAction> {
  return (dispatch, getState) => {
    if (typeof id !== 'string' || !id.length) {
      return { type: 'NO_OP' };
    }
    // dispatch actions only if selected node actually changed
    if (getState().activeNode.id !== id) {
      // Immediately save currently opened note
      const currentEditorContent = getState().editorContent;
      if (currentEditorContent.id) {
        _editorContentStorage.save(currentEditorContent)
          .catch((err: Error) => { console.log(err); }); // TODO: log error?
      }

      const returnVal = dispatch({
        type: notesListActionTypes.SELECT_NODE,
        payload: {
          nodeId: id,
          path,
        },
      });

      // Fetch note content only if:
      // 1) newly selected node represents a note ('item'), as opposed to a folder.
      // 2) newly selected node is not the already opened note
      const nodeInfo = translateNodeIdToInfo({ nodeId: id });
      if (nodeInfo && nodeInfo.type === 'item') {
        const uniqid = nodeInfo.uniqid;
        if (uniqid !== currentEditorContent.id) {
          dispatch(fetchEditorContentThunkAction({ noteId: uniqid }))
            .catch((err: ActionError) => {
              window.alert(`Error loading saved note content: ${err.message}`);
              return err.action;
            }); // TODO: adjust error handling.
        }
      }

      return returnVal;
    } else {
      return { type: 'NO_OP' };
    }
  };
}

/**
 * ...
 * @param {Object} params
 * @param {Object} params.node
 */
export function deleteNodeThunkAction({ node }: { node: TreeNodeT })
  : ThunkAction<Promise<AnyAction>, AppStateT, any, AnyAction> {
  return (dispatch, getState) => {
    let itemIds: Array<string> = [];

    // Collect the uniqid of all items to delete.
    if (node.type === 'item') {
      itemIds = [node.uniqid];
    } else if (node.type === 'folder') {
      if (node.children && node.children.length) {
        itemIds = getDescendantItems({ node }).map(node => node.uniqid);
      } else {
        itemIds = [];
      }
    }
    // dispatch action to delete note(s) from storage
    return dispatch(removeNoteThunkAction({ ids: itemIds }))
      .then((action: AnyAction) => {
        console.log(`Number of notes deleted: ${ action.payload.count }`); // TODO: remove
        // if delete from storage succeeded, then remove node from tree
        const retVal = dispatch({
          type: notesListActionTypes.DELETE_NODE,
          payload: {
            nodeToDelete: node,
            activePath: getState().activeNode.path,
            now: Date.now(),
          },
        });

        // If deleted node is part of the active path, then switch to a new active node
        if (getState().activeNode.path.lastIndexOf(node.id) >= 0) {
          // Retrieve the children (siblings of active node) of current folder.
          const children = selectSiblingsOfActiveNode(getState()) as TreeNodeT[];
          // After node deletion, select a node amongst the children nodes
          dispatch(switchActiveNodeOnDeleteAction({ deletedNodeId: node.id, children }));

          // Fetch note content only if:
          // 1) newly selected node represents a note ('item'), as opposed to a folder.
          // 2) newly selected node is not the already opened note
          const nodeInfo = translateNodeIdToInfo({ nodeId: getState().activeNode.id });
          if (nodeInfo && nodeInfo.type === 'item') {
            const uniqid = nodeInfo.uniqid;
            if (uniqid !== getState().editorContent.id) {
              dispatch(fetchEditorContentThunkAction({ noteId: uniqid }))
                .catch((err: ActionError) => {
                  window.alert(`Error loading saved note content: ${ err.message }`);
                  return err.action;
                }); // TODO: adjust error handling.
            }
          } else {
            // TODO Load blank editor canvas
          }
        }

        return retVal;
      })
      .catch((err: ActionError) => {
        window.alert(`ERROR deleting saved note: ${ err.message }`);
        return err.action;
      });
  };
}

/**
 * ...
 * @param {Object} params
 * @param {string} params.deletedNodeId
 * @param {Object[]} params.children
 */
export function switchActiveNodeOnDeleteAction({ deletedNodeId, children }: { deletedNodeId: TreeNodeT['id'], children: TreeNodeT[] })
  : AnyAction {
  return {
    type: notesListActionTypes.SWITCH_NODE_ON_DELETE,
    payload: {
      deletedNodeId: deletedNodeId,
      children,
    },
  };
}

/**
 * ...
 * @param {Object} params
 * @param {string} params.kind
 */
export function addAndSelectNodeThunkAction({ kind }: { kind: NodeTypeT })
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
        now: Date.now(),
      },
    });
  };
}

/**
 * ...
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
      .then((notesTree: NotesTreeT) => {
        if (notesTree && Array.isArray(notesTree.tree)) {
          const tree = notesTree.tree;
          const activeNodeId = tree.length ? tree[0].id : '';
          const activeNode: ActiveNodeT = {
            id: activeNodeId,
            path: [activeNodeId], // TODO: adjust activeNode to where user left off
          };
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
              nodeId: activeNode.id,
              path: activeNode.path,
            },
          });

          return Promise.resolve(returnVal);
        } else {
          const error = new Error('Unrecognized data fetched');
          return Promise.reject(error);
        }
      })
      .catch((err: Error) => {
        // If no tree found for this user, use default empty tree and add new node (new blank note)
        const error = new Error(`No tree loaded. Error: "${err.message}" Using default tree.`);
        // TODO: Remove
        console.log(error);
        dispatch({
          type: notesListActionTypes.FETCH_NOTES_TREE_FAILURE,
          payload: { error },
        });
        const now = Date.now();
        // Default tree is empty
        const defaultNotesTree: NotesTreeT = {
          tree: [],
          id: uuid(),
          dateCreated: now,
          dateModified: now,
        };
        dispatch({
          type: notesListActionTypes.CHANGE_NOTES_TREE,
          payload: {
            notesTree: defaultNotesTree,
          },
        });
        // To represent no node selected, use empty string
        dispatch({
          type: notesListActionTypes.SELECT_NODE,
          payload: {
            nodeId: '',
            path: [''],
          },
        });

        // Add a "note" node (an item) to the root of the tree
        return dispatch(addAndSelectNodeThunkAction({ kind: 'item' }));
      });
  };
}

/**
 * ...
 * @param {Object} params
 * @param {number} params.idx
 */
export function navigatePathThunkAction({ idx }: { idx: number })
  : ThunkAction<Promise<AnyAction>, AppStateT, any, AnyAction> {
  // 1. Switch folder and select first child
  // 2. Fetch note if selected child is a note
  return (dispatch, getState) => {
    dispatch({
      type: notesListActionTypes.NAVIGATE_PATH,
      payload: {
        idx,
      },
    });

    // Select a child of folder the user just navigated to
    const children = selectSiblingsOfActiveNode(getState());
    let retVal: AnyAction = dispatch({
      type: notesListActionTypes.SWITCH_NODE_ON_TREE_BRANCH_CHANGE,
      payload: {
        branch: children,
      }
    });

    const activeNodeInfo = translateNodeIdToInfo({ nodeId: getState().activeNode.id });
    // Fetch note content if newly selected node is a note, as opposed to a folder.
    if ( activeNodeInfo && activeNodeInfo.type === 'item') {
      const uniqid = activeNodeInfo.uniqid;
      // Fetch note content only if not already loaded
      if (uniqid !== getState().editorContent.id) {
        return dispatch(fetchEditorContentThunkAction({ noteId: uniqid }))
          .catch((err: ActionError) => {
            window.alert(`Error loading saved note content: ${err.message}`);
            return err.action;
          }); // TODO: adjust error handling.
      }
    } else {
      //TODO: Load blank editor canvas...
    }

    return Promise.resolve(retVal);
  };
}

/**
 * ...
 * @param {Object} params
 * @param {TreeNodeT[]} params.branch
 */
export function changeNotesTreeBranchThunkAction({ branch }: { branch: TreeNodeT[] })
  : ThunkAction<Promise<AnyAction>, AppStateT, any, AnyAction> {
  return (dispatch, getState) => {
    if (!Array.isArray(branch)) {
      branch = [];
    }

    const retVal = dispatch({
      type: notesListActionTypes.CHANGE_NOTES_TREE_BRANCH,
      payload: {
        branch,
        activePath: getState().activeNode.path,
        now: Date.now(),
      },
    });

    dispatch({
      type: notesListActionTypes.SWITCH_NODE_ON_TREE_BRANCH_CHANGE,
      payload: {
        branch,
      },
    });

    const activeNodeInfo = translateNodeIdToInfo({ nodeId: getState().activeNode.id });
    // Fetch note content if newly selected node is a note, as opposed to a folder.
    if ( activeNodeInfo && activeNodeInfo.type === 'item') {
      const uniqid = activeNodeInfo.uniqid;
      // Fetch note content only if not already loaded
      if (uniqid !== getState().editorContent.id) {
        return dispatch(fetchEditorContentThunkAction({ noteId: uniqid }))
          .catch((err: ActionError) => {
            window.alert(`Error loading saved note content: ${err.message}`);
            return err.action;
          }); // TODO: adjust error handling.
      }
    } else {
      //TODO: Load blank editor canvas...
    }

    return Promise.resolve(retVal);
  };
}

/**
 * ...
 * @param {Object} params
 * @param {string} params.title
 * @param {TreeNodeT} params.node
 */
export function changeNodeTitleAction({ title, node }: { title: string, node: TreeNodeT })
  : AnyAction {
  return {
    type: notesListActionTypes.CHANGE_NODE_TITLE,
    payload: {
      title,
      node,
      now: Date.now(),
    },
  };
}
