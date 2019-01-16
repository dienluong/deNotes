import notesListActionTypes from '../actions/constants/notesListActionConstants';
import baseState from '../misc/initialState';
import { getNodeAtPath } from 'react-sortable-tree';
import { getNodeKey } from '../../utils/treeUtils';

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
    // Empty string for active node ID because we switched parent folder but no node in that folder is selected by default
    return {
      ...currentActive,
      id: '',
      path: [...currentActive.path.slice(0, idx + 1), ''],
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
      const newActiveId: TreeNodeT['id'] = Array.isArray(children) && children.length ? children[0].id : '';
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
 * @param {string[]} [path]
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
    newPath = path;
  } else {
    // If no path provided, use the current active path
      newPath = [...(currentActive.path.slice(0, -1)), nodeId];
  }
  return { id: nodeId, path: newPath };
}

function _switchActiveNodeOnBranchChange({ currentActive, branch }: { currentActive: ActiveNodeT, branch: TreeNodeT[] } )
  : ActiveNodeT {
  const activePath = currentActive.path;
  // If active node no longer present after branch changed, switch active node to first child of the branch
  if (!getNodeAtPath({ treeData: branch, path: [activePath[activePath.length - 1]], getNodeKey, ignoreCollapsed: false })) {
    const parentPath: ActiveNodeT['path'] = activePath.slice(0, -1);
    const newActiveNode: ActiveNodeT = { ...currentActive };
    newActiveNode.id = Array.isArray(branch) && branch[0] ? branch[0].id : '';
    newActiveNode.path = [...parentPath, newActiveNode.id];
    return newActiveNode;
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
      if (state.id === action.payload.nodeId) {
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
    case notesListActionTypes.SWITCH_NODE_ON_TREE_BRANCH_CHANGE:
      return _switchActiveNodeOnBranchChange({
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
