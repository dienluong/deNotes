import notesListActionTypes from '../actions/constants/notesListActionConstants';
import baseState from '../misc/initialState';
import { getNodeAtPath } from 'react-sortable-tree';
import { getNodeKey } from '../../utils/treeUtils';
import { NONE_SELECTED } from '../../utils/appCONSTANTS';

// Types
import { AnyAction } from 'redux';

const initialActiveNode = baseState.activeNode;

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
  // If last entry of the path was selected, then no need to change active node
  if (Number.isSafeInteger(idx) && idx < (currentActive.path.length - 1)) {
    // Active node ID set to NONE_SELECTED because we switched parent folder but no node in that folder is selected by default
    return {
      ...currentActive,
      id: NONE_SELECTED,
      path: [...currentActive.path.slice(0, idx + 1), NONE_SELECTED],
    };
  } else {
    return currentActive;
  }
}

function _changeActiveNodeOnDelete({ currentActive, deletedNodeId, children }: { currentActive: ActiveNodeT, deletedNodeId: string, children: TreeNodeT[]})
  : ActiveNodeT {
  let returnedActiveNode: ActiveNodeT = currentActive;
  // if deleted node is part of the active path, re-adjust the active node
  const deletedNodeIdx = currentActive.path.lastIndexOf(deletedNodeId);
  if (deletedNodeIdx >= 0) {
      // New active node is the first child
      const newActiveId: TreeNodeT['id'] = Array.isArray(children) && children.length ? children[0].id : NONE_SELECTED;
      // Since deleted node is part of active path, truncate the path and concat the selected child's ID
      const newActivePath: ActiveNodeT['path'] = [...(currentActive.path.slice(0, deletedNodeIdx)), newActiveId];
      returnedActiveNode = {
        ...currentActive,
        id: newActiveId,
        path: newActivePath,
      };
  }

  return returnedActiveNode;
}

/**
 * @param {object} currentActive
 * @param {string} nodeId
 * @param {string[]} [path] Path is given if selected node is from path different from current active one.
 * @return {object}
 * @private
 */
function _changeActiveNodeOnSelect({ currentActive, nodeId, path }: { currentActive: ActiveNodeT, nodeId: TreeNodeT['id'], path?: TreeNodePathT })
  : ActiveNodeT {
  let newPath: string[];

  if (!nodeId) {
    return currentActive;
  }

  // Expect to receive a path when change to active node was not triggered by user event, for example on load of state from storage.
  if (Array.isArray(path) && path.length) {
    // A proper path must end with the ID of the referred node
    if (path[path.length - 1] === nodeId) {
      newPath = path;
    } else {
      return currentActive;
    }
  } else {
    // If no path provided, use the current active path
      newPath = [...(currentActive.path.slice(0, -1)), nodeId];
  }
  return { id: nodeId, path: newPath };
}

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

export default function activeNodeReducer(state: ActiveNodeT = initialActiveNode, action: AnyAction)
  : ActiveNodeT {
  if (!action.payload) {
    action.type = '';
  }
  console.log(`REDUCER: '${action.type}'`);
  switch (action.type) {
    case notesListActionTypes.SELECT_NODE: {
      if (state.id && (state.id === action.payload.nodeId)) {
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
    case notesListActionTypes.SWITCH_NODE_ON_DELETE: {
      if (!action.payload.deletedNodeId) {
        return state;
      }
      return _changeActiveNodeOnDelete({
        currentActive: state,
        ...action.payload,
      });
    }
    case notesListActionTypes.SWITCH_NODE_ON_TREE_FOLDER_CHANGE:
      return _switchActiveNodeOnFolderChange({
        currentActive: state,
        ...action.payload,
      });
    default:
      if (process.env.REACT_APP_DEBUG) {
        console.log(`Current activeNode: ${JSON.stringify(state)}`);
      }
      return state;
  }
}

export const selectPath = (state: ActiveNodeT) => state.path;
export const selectId = (state: ActiveNodeT) => state.id;
