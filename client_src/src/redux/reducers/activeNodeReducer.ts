import notesListActionTypes from '../actions/constants/notesListActionConstants';
import baseState from '../misc/initialState';
import { equals } from '../../utils/treeUtils';

// Types
import { AnyAction } from 'redux';

const initialActiveNode = baseState.activeNode;

/**
 * Sets the active ID to the newly selected node along the active path. The active path is truncated accordingly.
 * @param currentActive
 * @param idx
 * @returns {*}
 * @private
 */
function _changeActiveNodeOnPathNavClick({ currentActive, idx }: { currentActive: ActiveNodeT, idx: number })
  : ActiveNodeT {
  if (Number.isSafeInteger(idx) && idx < currentActive.path.length) {
    return {
      ...currentActive,
      id: currentActive.path[idx],
      path: currentActive.path.slice(0, idx + 1),
    };
  } else {
    return currentActive;
  }
}

function _changeActiveNodeOnDelete({ currentActive, deletedNodeId }: { currentActive: ActiveNodeT, deletedNodeId: string })
  : ActiveNodeT {
  let returnedActiveNode = currentActive;
  // if deleted node is part of the active path, re-adjust the active node
  const deletedNodeIdx = currentActive.path.lastIndexOf(deletedNodeId);
  if (deletedNodeIdx >= 0) {
    if (deletedNodeIdx !== 0) {
      // Since deleted node is part of active path, then truncate the path
      const newActivePath = currentActive.path.slice(0, deletedNodeIdx);
      const newActiveId = newActivePath[newActivePath.length - 1];
      returnedActiveNode = {
        ...currentActive,
        id: newActiveId,
        path: newActivePath,
      };
    } else {
      // TODO: Deleting the root folder should never occur, or be allowed.
      return returnedActiveNode;
    }
  }

  return returnedActiveNode;
}

function _changeActiveNodeOnSelect({ currentActive, nodeId }: { currentActive: ActiveNodeT, nodeId: string })
  : ActiveNodeT {
  let newPath: string[];

  if (!nodeId) {
    return currentActive;
  }

  // The length of current active path should always be at least 2: one entry for parent root folder and one for active node itself
  if (currentActive.path.length >= 2) {
    newPath = [...(currentActive.path.slice(0, -1)), nodeId];
  } else {
    // this case should never occur
    newPath = [...currentActive.path];
  }

  return { id: nodeId, path: newPath };
}


// TODO: remove
// function _arraysAreEqual(arr1, arr2) {
//   if (Object.is(arr1, arr2)) { return true; }
//   if (!(Array.isArray(arr1) && Array.isArray(arr2))) { return false; }
//   if (arr1.length !== arr2.length) { return false; }
//   return arr1.every((val, idx) => val === arr2[idx]);
// }

export default function activeNodeReducer(state: ActiveNodeT = initialActiveNode, action: AnyAction)
  : ActiveNodeT {
  if (!action.payload) {
    return state;
  }
  console.log(`REDUCER: ${action.type}`);
  switch (action.type) {
    case notesListActionTypes.SELECT_NODE: {
      if (state.id === action.payload.nodeId) {
        return state;
      }
      else {
        return _changeActiveNodeOnSelect({
          currentActive: state,
          nodeId: action.payload.nodeId,
        });
      }
    }
    case notesListActionTypes.NAVIGATE_PATH: {
      const newActiveNode = _changeActiveNodeOnPathNavClick({
        currentActive: state,
        idx: action.payload.idx,
      });

      if (equals(state, newActiveNode)) { return state; }
      else { return newActiveNode; }
    }
    case notesListActionTypes.SWITCH_NODE_ON_DELETE: {
      if (!action.payload.deletedNode) {
        return state;
      }
      const newActiveNode = _changeActiveNodeOnDelete({
        currentActive: state,
        deletedNodeId: action.payload.deletedNode.id,
      });

      if (equals(state, newActiveNode)) { return state; }
      else { return newActiveNode; }
    }
    default:
      if (process.env.REACT_APP_DEBUG) {
        console.log(`Current activeNode: ${JSON.stringify(state)}`);
      }
      return state;
  }
}

export const selectPath = (state: ActiveNodeT) => state.path;
export const selectId = (state: ActiveNodeT) => state.id;
