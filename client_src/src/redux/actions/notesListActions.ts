import notesListActionTypes from './constants/notesListActionConstants';
import { MODAL_TYPES } from '../../components/ModalManager';
import { newContentAction, fetchEditorContentThunkAction, removeNoteThunkAction } from './editorActions';
import { showModalAction, hideModalAction } from './modalActions';
import { translateNodeIdToInfo, getDescendantItems, createNode, findDeepestFolder } from '../../utils/treeUtils';
import * as rootReducer from '../reducers';
import initialState from '../misc/initialState';
import { NONE_SELECTED, nodeTypes } from '../../utils/appCONSTANTS';

// Types
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { PropsT as RenameNodeModalPropsT } from '../../components/widgets/RenameNodeModal';

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

    const parentIdx = findDeepestFolder(rootReducer.selectActiveNodePath(getState()));
    if (parentIdx === null) {
      return {
        type: 'NO_OP',
        payload: {
          error: new Error('Invalid active path'),
        },
      };
    }

    // If selection was done during tree Edit Mode
    if (rootReducer.selectNotesTreeEditMode(getState())) {
      if (parentIdx === -1) {
        // If at root folder, then use received path because that path is the absolute path to the selected node
        return dispatch({
          type: notesListActionTypes.EDIT_MODE_SELECT_NODE,
          payload: {
            nodeId: id,
            path,
          },
        });
      } else {
        // If not at root, then path received is only partial. So construct absolute path to selected node w/ the current active path.
        return dispatch({
          type: notesListActionTypes.EDIT_MODE_SELECT_NODE,
          payload: {
            nodeId: id,
            path: [...rootReducer.selectActiveNodePath(getState()).slice(0, parentIdx + 1), id],
          },
        });
      }
    }

    /* >>>>> Section below is for selection done outside of tree Edit Mode <<<<< */
    // Immediately save currently opened note
    const currentEditorContent = rootReducer.selectEditorContent(getState());
    if (currentEditorContent.id) {
      _editorContentStorage.save(currentEditorContent)
        .catch((err: Error) => { console.log(err); }); // TODO: log error?
    }

    let returnVal;
    // If at root folder, then use received path because that path is the absolute path to the selected node
    if (parentIdx === -1) {
      returnVal = dispatch({
        type: notesListActionTypes.SELECT_NODE,
        payload: {
          nodeId: id,
          path,
        },
      });
    } else {
      // If not at root, then path received is only partial. So construct absolute path to selected node by using the current active path.
      returnVal = dispatch({
        type: notesListActionTypes.SELECT_NODE,
        payload: {
          nodeId: id,
          path: [...rootReducer.selectActiveNodePath(getState()).slice(0, parentIdx + 1), id],
        },
      });
    }

    // If new active node is an ITEM (note) and if its content is not already open, then fetch its content and close the notes list
    const activeNodeInfo = translateNodeIdToInfo({ nodeId: rootReducer.selectActiveNodeId(getState()) });
    if ( activeNodeInfo && activeNodeInfo.type === nodeTypes.ITEM) {
      const uniqid = activeNodeInfo.uniqid;
      // Fetch note content only if not already loaded
      if (uniqid !== rootReducer.selectEditorContentId(getState())) {
        dispatch(fetchEditorContentThunkAction({ noteId: uniqid }))
          .catch((err: ActionError) => {
            window.alert(`Error loading saved note content: ${err.message}`);
            return err.action;
          }); // TODO: adjust error handling.
      }

      dispatch(closeListAction());
    }

    return returnVal;
  };
}

/**
 * ...
 */
export function deleteNodeThunkAction()
  : ThunkAction<Promise<AnyAction>, AppStateT, any, AnyAction> {
  return (dispatch, getState) => {
    let itemUniqids: string[] = [];
    const selectedNodeIds = rootReducer.selectNotesTreeEditModeSelectedNodes(getState());

    // Collect the uniqid of all items to be deleted
    selectedNodeIds.forEach(id => {
      const nodeInfo = translateNodeIdToInfo({ nodeId: id });
      if (nodeInfo) {
        if (nodeInfo.type === nodeTypes.ITEM) {
          itemUniqids.push(nodeInfo.uniqid);
        } else if (nodeInfo.type === nodeTypes.FOLDER) {
          getDescendantItems({ nodeId: id, tree: rootReducer.selectNotesTreeTree(getState()) }).forEach(node => itemUniqids.push(node.uniqid));
        }
      }
    });

    // dispatch action to delete note(s) from storage
    return dispatch(removeNoteThunkAction({ ids: itemUniqids }))
      .then((action: AnyAction) => {
        console.log(`Number of notes deleted: ${ action.payload.count }`); // TODO: remove
        // if delete from storage succeeded, then remove node from tree
        const retVal = dispatch({
          type: notesListActionTypes.DELETE_NODE,
          payload: {
            now: Date.now(),
          },
        });

        // If any deleted node is part of the active path, then switch to a new active node
        dispatch({
          type: notesListActionTypes.SWITCH_NODE_ON_DELETE,
          payload: {
            deletedNodeIds: selectedNodeIds,
          },
        });

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
 * @param {string} params.kind
 */
export function addAndSelectNodeThunkAction({ kind }: { kind: NodeTypeT })
  : ThunkAction<AnyAction, AppStateT, any, AnyAction> {
  return (dispatch, getState) => {
    const now = Date.now();

    // Immediately save currently opened note
    const currentContent = rootReducer.selectEditorContent(getState());
    if (currentContent.id) {
      _editorContentStorage.save(currentContent)
        .catch((err: Error) => console.log(err)); // TODO: log error?
    }

    const newNode: TreeNodeT = createNode({ type: kind });
    let parentPath: ActiveNodeT['path'];
    let parentKey: TreeNodeT['id'];

    // Determine parent path and key
    const parentIdx = findDeepestFolder(rootReducer.selectActiveNodePath(getState()));
    if (parentIdx === null || parentIdx === -1) {
      // case where parent folder is root
      parentPath = [];
      parentKey = '';
    } else {
      parentPath = rootReducer.selectActiveNodePath(getState()).slice(0, parentIdx + 1);
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

    const modalProps: RenameNodeModalPropsT = {
      nodeType: kind,
      currentName: newNode.title,
      onCloseHandler: () => dispatch(hideModalAction()),
      onSubmitHandler: ({ name }: { name: string }) => {
        dispatch(hideModalAction());
        dispatch(changeNodeTitleAction({ title: name || newNode.title, node: newNode }))
      },
    };

    dispatch(showModalAction({
      type: MODAL_TYPES.RENAME_NODE,
      props: modalProps,
    }));


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

      // TODO set editor content in reducer on newContentAction
      const newEditorContent = {
          ...initialState.editorContent,
          id: newNode.uniqid,
          title: newNode.title,
          dateCreated: now,
          dateModified: now,
          readOnly: false,
        };

      dispatch(newContentAction({ editorContent: newEditorContent }));
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
    const userId = rootReducer.selectUserInfoId(getState());
    dispatch({
      type: notesListActionTypes.FETCH_NOTES_TREE,
      payload: { userId },
    });

    // Immediately save currently opened note
    const currentContent = rootReducer.selectEditorContent(getState());
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
        // TODO: set default tree in reducer for action FETCH_NOTES_TREE_FAILURE!
        // Default tree is empty
        const defaultNotesTree: NotesTreeT = {
          tree: [],
          id: 'default',
          visible: true,
          editMode: false,
          editModeSelectedNodes: [],
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

export function enterEditModeAction(): AnyAction {
  return {
    type: notesListActionTypes.SET_EDIT_MODE,
    payload: { value: true },
  }
}

export function exitEditModeAction(): AnyAction {
  return {
    type: notesListActionTypes.SET_EDIT_MODE,
    payload: { value: false },
  }
}

export function closeListAction(): AnyAction {
  return {
    type: notesListActionTypes.CLOSE_LIST,
    payload: {},
  }
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
    const currentContent = rootReducer.selectEditorContent(getState());
    if (currentContent.id) {
      _editorContentStorage.save(currentContent)
        .catch((err: Error) => console.log(err)); // TODO: log error?
    }

    return dispatch({
      type: notesListActionTypes.CHANGE_NOTES_TREE_FOLDER,
      payload: {
        folder,
        activePath: rootReducer.selectActiveNodePath(getState()),
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
  if (!title.trim()) {
    title = node.title;
  }

  return {
    type: notesListActionTypes.CHANGE_NODE_TITLE,
    payload: {
      title,
      node,
      now: Date.now(),
    },
  };
}
