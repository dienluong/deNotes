import uuid from 'uuid/v4';
import notesListActionTypes from './constants/notesListActionConstants';
import editorActionTypes from './constants/editorActionConstants';
import { fetchEditorContentThunkAction, removeNoteThunkAction } from './editorActions';
import { translateNodeIdToInfo, getDescendantItems, createNode, findDeepestFolder } from '../../utils/treeUtils';
import initialState from '../misc/initialState';
import { NONE_SELECTED, nodeTypes } from '../../utils/appCONSTANTS';

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
 * @param {string[]} [params.path] If path not provided, then selected node is assumed to be in current active path.
 */
export function selectNodeThunkAction({ id, path }: { id: TreeNodeT['id'], path: TreeNodePathT })
  : ThunkAction<AnyAction, AppStateT, any, AnyAction> {
  return (dispatch, getState) => {
    if (typeof id !== 'string' || !id.length) {
      return {
        type: 'NO_OP',
        payload: {
          error: new Error('Invalid id'),
        }
      };
    }
    // Immediately save currently opened note
    const currentEditorContent = getState().editorContent;
    if (currentEditorContent.id) {
      _editorContentStorage.save(currentEditorContent)
        .catch((err: Error) => { console.log(err); }); // TODO: log error?
    }

    let returnVal;
    const parentIdx = findDeepestFolder(getState().activeNode.path);
    if (parentIdx === null) {
      return {
        type: 'NO_OP',
        payload: {
          error: new Error('Invalid active path'),
        },
      };
    }
    // If at root folder, then use received path because that path is the absolute path to the selected node
    // If not at root, then construct the path to the selected node from the current active path.
    if (parentIdx === -1) {
      returnVal = dispatch({
        type: notesListActionTypes.SELECT_NODE,
        payload: {
          nodeId: id,
          path,
        },
      });
    } else {
      returnVal = dispatch({
        type: notesListActionTypes.SELECT_NODE,
        payload: {
          nodeId: id,
          path: [...getState().activeNode.path.slice(0, parentIdx + 1), id],
        },
      });
    }

    // If new active node is an ITEM (note) and if its content is not already open, then fetch its content
    const activeNodeInfo = translateNodeIdToInfo({ nodeId: getState().activeNode.id });
    if ( activeNodeInfo && activeNodeInfo.type === nodeTypes.ITEM) {
      const uniqid = activeNodeInfo.uniqid;
      // Fetch note content only if not already loaded
      if (uniqid !== getState().editorContent.id) {
        dispatch(fetchEditorContentThunkAction({ noteId: uniqid }))
          .catch((err: ActionError) => {
            window.alert(`Error loading saved note content: ${err.message}`);
            return err.action;
          }); // TODO: adjust error handling.
      }
    }

    return returnVal;
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
    if (node.type === nodeTypes.ITEM) {
      itemIds = [node.uniqid];
    } else if (node.type === nodeTypes.FOLDER) {
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
            now: Date.now(),
          },
        });

        // If deleted node is part of the active path, then switch to a new active node
        if (getState().activeNode.path.lastIndexOf(node.id) >= 0) {
          dispatch(switchActiveNodeOnDeleteAction({ deletedNodeId: node.id }));
          // TODO Load blank editor canvas
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
 */
export function switchActiveNodeOnDeleteAction({ deletedNodeId }: { deletedNodeId: TreeNodeT['id'] })
  : AnyAction {
  return {
    type: notesListActionTypes.SWITCH_NODE_ON_DELETE,
    payload: {
      deletedNodeId: deletedNodeId,
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
    const state = getState();
    const now = Date.now();

    // Immediately save currently opened note
    const currentContent = state.editorContent;
    if (currentContent.id) {
      _editorContentStorage.save(currentContent)
        .catch((err: Error) => console.log(err)); // TODO: log error?
    }

    const newNode: TreeNodeT = createNode({ type: kind });
    let parentPath: ActiveNodeT['path'];
    let parentKey: TreeNodeT['id'];

    /*
    // Determine parent path of the new node
    if (equals(state.activeNode.path, [NONE_SELECTED])){
      // case where active node is root folder (i.e. active ID = NONE_SELECTED and path = [NONE_SELECTED])
      parentPath = [];
    } else {
      const activeNodeInfo = translateNodeIdToInfo({ nodeId: state.activeNode.id });
      if (activeNodeInfo && activeNodeInfo.type === nodeTypes.FOLDER) {
        parentPath = state.activeNode.path;
      } else {
        // If current active node is not a FOLDER, simply truncate its path to obtain the parent path.
        parentPath = state.activeNode.path.slice(0, -1);
      }
    }
    // Determine parent key
    if (parentPath.length) {
      parentKey = parentPath[parentPath.length - 1];
    } else {
      // If path to parent node is [], then it means the active node is at the very root of the tree.
      parentKey = '';
    }
    */

    // Determine parent path and key
    const parentIdx = findDeepestFolder(state.activeNode.path);
    if (parentIdx === null || parentIdx === -1) {
      // case where parent folder is root
      parentPath = [];
      parentKey = '';
    } else {
      parentPath = state.activeNode.path.slice(0, parentIdx + 1);
      parentKey = parentPath[parentIdx];
    }

    const returnVal = dispatch({
      type: notesListActionTypes.ADD_NODE,
      payload: {
        newNode,
        parentKey,
        now,
      },
    });

    const newNodeInfo = translateNodeIdToInfo({ nodeId: newNode.id });
    // Only change active node and editor content if newly added node is of type ITEM (i.e. a note), as opposed to a FOLDER.
    if (newNodeInfo && newNodeInfo.type === nodeTypes.ITEM) {
      const newActiveNodeId: ActiveNodeT['id'] = newNode.id;
      const newActiveNodePath: ActiveNodeT['path'] = [...parentPath, newNode.id];
      dispatch({
        type: notesListActionTypes.SELECT_NODE,
        payload: {
          nodeId: newActiveNodeId,
          path: newActiveNodePath,
        },
      });

      const newEditorContent = {
          ...initialState.editorContent,
          id: newNode.uniqid,
          title: newNode.title,
          dateCreated: now,
          dateModified: now,
          readOnly: false,
        };

      dispatch({
        type: editorActionTypes.NEW_EDITOR_CONTENT,
        payload: {
          newEditorContent,
        }
      })
    }

    return returnVal;
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

    // Immediately save currently opened note
    const currentContent = getState().editorContent;
    if (currentContent.id) {
      _editorContentStorage.save(currentContent)
        .catch((err: Error) => console.log(err)); // TODO: log error?
    }

    return _notesTreeStorage.load({ userId })
      .then((notesTree: NotesTreeT) => {
        if (notesTree && Array.isArray(notesTree.tree)) {
          // Select root folder
          // TODO: adjust activeNode to where user left off
          const activeNode: ActiveNodeT = {
            id: NONE_SELECTED,
            path: [NONE_SELECTED],
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
        const returnVal = dispatch({
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
        // Select root
        dispatch({
          type: notesListActionTypes.SELECT_NODE,
          payload: {
            nodeId: NONE_SELECTED,
            path: [NONE_SELECTED],
          },
        });

        return Promise.resolve(returnVal);
      });
  };
}

/**
 * ...
 * @param {Object} params
 * @param {number} params.idx
 */
export function navigatePathThunkAction({ idx }: { idx: number })
  : ThunkAction<AnyAction, AppStateT, any, AnyAction> {
  // 1. Save current editor content
  // 2. Switch folder
  return (dispatch, getState) => {
    // immediately save currently opened note
    const currentContent = getState().editorContent;
    if (currentContent.id) {
      _editorContentStorage.save(currentContent)
        .catch((err: Error) => console.log(err)); // TODO: log error?
    }

    return dispatch({
      type: notesListActionTypes.NAVIGATE_PATH,
      payload: {
        idx,
      },
    });
  };
}

export function goUpAFolderAction(): AnyAction {
  return {
    type: notesListActionTypes.GO_UP_A_FOLDER,
    payload: {},
  };
}

export function goToRootAction(): AnyAction {
  return {
    type: notesListActionTypes.GO_TO_ROOT,
    payload: {},
  };
}

/**
 * ...
 * @param {Object} params
 * @param {TreeNodeT[]} params.folder
 */
export function changeNotesFolderThunkAction({ folder }: { folder: TreeNodeT[] })
  : ThunkAction<AnyAction, AppStateT, any, AnyAction> {
  return (dispatch, getState) => {
    if (!Array.isArray(folder)) {
      folder = [];
    }

    // immediately save currently opened note
    const currentContent = getState().editorContent;
    if (currentContent.id) {
      _editorContentStorage.save(currentContent)
        .catch((err: Error) => console.log(err)); // TODO: log error?
    }

    return dispatch({
      type: notesListActionTypes.CHANGE_NOTES_TREE_FOLDER,
      payload: {
        folder,
        activePath: getState().activeNode.path,
        now: Date.now(),
      },
    });
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
