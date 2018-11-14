import notesListActionTypes from '../actions/constants/notesListActionConstants';
import baseState from '../misc/initialState';
import { equals } from '../../utils/treeUtils';

const initialActiveNode = baseState.activeNode;

/**
 * Sets the active ID to the newly selected node along the active path.  (The active path remains the same.)
 * @param currentActive
 * @param idx
 * @returns {*}
 * @private
 */
function _changeActiveNodeOnPathNavClick({ currentActive, idx }) {
  if (Number.isSafeInteger(idx) && idx < currentActive.path.length) {
    return {
      ...currentActive,
      id: currentActive.path[idx],
      path: currentActive.path,
    };
  } else {
    return currentActive;
  }
}

function _changeActiveNodeOnDelete({ currentActive, deletedNode }) {
  let returnedActiveNode = currentActive;
  // if deleted node is part of the active path, re-adjust the active node
  const deletedNodeIdx = currentActive.path.lastIndexOf(deletedNode.id);
  if (deletedNodeIdx >= 0) {
    if (deletedNodeIdx === 0) {
      // TODO: Deleting the root folder should never be allowed.
      returnedActiveNode = {
        ...currentActive,
        id: '',
        path: [],
      };
    } else {
      // Since deleted node is part of active path, then truncate the path
      // Only change the active node (i.e. change the active node ID) if deleted node is one of its parents
      const currentActiveIdx = currentActive.path.lastIndexOf(currentActive.id);
      const newActivePath = currentActive.path.slice(0, deletedNodeIdx);
      const newActiveId = currentActiveIdx >= deletedNodeIdx ? newActivePath[newActivePath.length - 1] : currentActive.path[currentActiveIdx];
      returnedActiveNode = {
        ...currentActive,
        id: newActiveId,
        path: newActivePath,
      };
    }
  }

  return returnedActiveNode;
}
// TODO: remove
// function _arraysAreEqual(arr1, arr2) {
//   if (Object.is(arr1, arr2)) { return true; }
//   if (!(Array.isArray(arr1) && Array.isArray(arr2))) { return false; }
//   if (arr1.length !== arr2.length) { return false; }
//   return arr1.every((val, idx) => val === arr2[idx]);
// }

export default function activeNodeReducer(state = initialActiveNode, action) {
  console.log(`REDUCER: ${action.type}`);
  switch (action.type) {
    case notesListActionTypes.SELECT_NODE: {
      if (equals(state, action.payload.activeNode)) { return state; }
      else { return { ...state, ...action.payload.activeNode }; }
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
      const newActiveNode = _changeActiveNodeOnDelete({
        currentActive: state,
        deletedNode: action.payload.deletedNode,
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

export const selectPath = (state) => state.path;
