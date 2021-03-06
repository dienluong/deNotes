import notesListActionTypes from '../actions/constants/notesListActionConstants';
import { findDeepestFolder } from '../../utils/treeUtils';
import baseState from '../misc/initialState';
import { NONE_SELECTED } from '../../utils/appCONSTANTS';

// Types
import { AnyAction } from 'redux';

const initialActiveNode: ActiveNodeT = { ...baseState.activeNode };

/**
 * Sets the active ID to the newly selected node along the active path. The active path is truncated accordingly.
 *
 * @param currentActive
 * @param idx
 * @returns {*}
 * @private
 */
function _changeActiveNodeOnPathNavClick({ currentActive, idx }: { currentActive: ActiveNodeT, idx: number })
  : ActiveNodeT {
  if (Number.isSafeInteger(idx) && idx < (currentActive.path.length - 1)) {
    const newActivePath = currentActive.path.slice(0, idx + 1);
    const newActiveNode = newActivePath.length ?
      { id: newActivePath[newActivePath.length - 1], path: newActivePath } :
      { id: NONE_SELECTED, path: [NONE_SELECTED] };
    return {
      ...currentActive,
      ...newActiveNode,
    };
  } else {
    // If last entry of the path was selected, then no need to change active node
    return currentActive;
  }
}

function _goUpAFolder({ currentActive }: { currentActive: ActiveNodeT })
  : ActiveNodeT {
  const currentParentIdx = findDeepestFolder(currentActive.path);
  if (currentParentIdx !== null) {
    if (currentParentIdx <= 0) {
      return {
        id: NONE_SELECTED,
        path: [NONE_SELECTED],
      }
    } else {
      return {
        id: currentActive.path[currentParentIdx - 1],
        path: currentActive.path.slice(0, currentParentIdx),
      };
    }
  } else {
    return currentActive;
  }
}

function _changeActiveNodeOnDelete({ currentActive, deletedNodeIds }: { currentActive: ActiveNodeT, deletedNodeIds: Array<TreeNodeT['id']> })
  : ActiveNodeT {
  let newActive: ActiveNodeT = currentActive;
  // if any of deleted nodes is the active node, re-adjust the active node
  if (deletedNodeIds.includes(currentActive.id)) {
      // Since deleted node is the active node, truncate the path to find its parent folder
      const newActivePath: ActiveNodeT['path'] = currentActive.path.slice(0, -1);
      // If the deleted node was at the root, then set NONE_SELECTED as new active node.
      if (!newActivePath.length) {
        newActivePath[0] = NONE_SELECTED;
      }
      newActive = {
        ...currentActive,
        id: newActivePath[newActivePath.length - 1],
        path: newActivePath,
      };
  }

  return newActive;
}

/**
 * @param {object} currentActive
 * @param {string} nodeId
 * @param {string[]} [path] Path is given if selected node is in path different from current active one.
 * @return {object}
 * @private
 */
function _changeActiveNodeOnSelect({ currentActive, nodeId, path }: { currentActive: ActiveNodeT, nodeId: TreeNodeT['id'], path?: TreeNodePathT })
  : ActiveNodeT {
  let newPath: string[];

  if (!nodeId) {
    return currentActive;
  }

  if (Array.isArray(path) && path.length) {
    // A proper path must end with the ID of the active node
    if (path[path.length - 1] === nodeId) {
      newPath = path;
    } else {
      return currentActive;
    }
  } else { // If no path provided, use the current active path
    const parentIdx = findDeepestFolder(currentActive.path);
    if (parentIdx === null) {
      return currentActive;
    }
    // If parent folder is root...
    if (parentIdx === -1) {
      newPath = [nodeId];
    } else {
      newPath = [...(currentActive.path.slice(0, parentIdx + 1)), nodeId];
    }
  }

  return { id: nodeId, path: newPath };
}

/*
function _switchActiveNodeOnFolderChange({ currentActive, folder }: { currentActive: ActiveNodeT, folder: TreeNodeT[] } )
  : ActiveNodeT {
  // If active node no longer present after folder changed, switch active node to first child of the folder
  if (!getNodeAtPath({ treeData: folder, path: [currentActive.id], getNodeKey, ignoreCollapsed: false })) {
    const parentPath: ActiveNodeT['path'] = currentActive.path.slice(0, -1);
    // Take ID of first child in folder
    const newId = Array.isArray(folder) && folder[0] ? folder[0].id : NONE_SELECTED;
    const newPath = [...parentPath, newId];
    return  { ...currentActive, id: newId, path: newPath };
  }

  return currentActive;
}
*/

export default function activeNodeReducer(state: ActiveNodeT = initialActiveNode, action: AnyAction)
  : ActiveNodeT {
  if (!action.payload) {
    action.type = '';
  }
  console.log(`REDUCER: '${action.type}'`);
  switch (action.type) {
    case notesListActionTypes.SELECT_NODE: {
      if (state.id && (state.id !== NONE_SELECTED) && (state.id === action.payload.nodeId)) {
        return state;
      }
      else {
        return _changeActiveNodeOnSelect({
          currentActive: state,
          ...action.payload,
        });
      }
    }
    case notesListActionTypes.NAVIGATE_PATH: {
      return _changeActiveNodeOnPathNavClick({
        currentActive: state,
        idx: action.payload.idx,
      });
    }
    case notesListActionTypes.GO_UP_A_FOLDER: {
      return _goUpAFolder({
        currentActive: state,
        ...action.payload,
      });
    }
    case notesListActionTypes.GO_TO_ROOT: {
      return {
        id: NONE_SELECTED,
        path: [NONE_SELECTED],
      };
    }
    case notesListActionTypes.SWITCH_NODE_ON_DELETE: {
      if (!Array.isArray(action.payload.deletedNodeIds) || !action.payload.deletedNodeIds.length) {
        return state;
      }
      return _changeActiveNodeOnDelete({
        currentActive: state,
        ...action.payload,
      });
    }
    // case notesListActionTypes.SWITCH_NODE_ON_TREE_FOLDER_CHANGE:
    //   return _switchActiveNodeOnFolderChange({
    //     currentActive: state,
    //     ...action.payload,
    //   });
    default:
      if (process.env.REACT_APP_DEBUG) {
        console.log(`Current activeNode: ${JSON.stringify(state)}`);
      }
      return state;
  }
}

export const selectPath = (state: ActiveNodeT) => state.path;
export const selectId = (state: ActiveNodeT) => state.id;
