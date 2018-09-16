import notesListActionTypes from '../actions/constants/notesListActionConstants';
import baseState from '../misc/initialState';

const initialActiveNode = baseState.activeNode;

function _changeActiveNodeOnPathNavClick({ currentActive, idx }) {
  let newActiveNode = currentActive;
  if (Number.isSafeInteger(idx) && idx < currentActive.path.length) {
    newActiveNode = {
      ...currentActive,
      id: currentActive.path[idx],
      // TODO: remove
      // path: currentActive.path.slice(0, idx + 1),
      path: currentActive.path,
    };
  }
  return newActiveNode;
}

function _changeActiveNodeOnDelete({ currentActive, deletedNode }) {
  let newActiveNode = currentActive;
  // if deleted node is part of the active path, re-adjust the active node
  const deletedNodeIdx = currentActive.path.lastIndexOf(deletedNode.id);
  if (deletedNodeIdx >= 0) {
    if (deletedNodeIdx === 0) {
      newActiveNode = {
        ...currentActive,
        id: '',
        path: [],
      };
    } else {
      const newActivePath = currentActive.path.slice(0, deletedNodeIdx);
      newActiveNode = {
        ...currentActive,
        id: newActivePath[newActivePath.length - 1],
        path: newActivePath,
      };
    }
  }

  return newActiveNode;
}

function _equals(currentActiveNode, newActiveNode) {
  const currentKeys = Object.keys(currentActiveNode);
  const newKeys = Object.keys(newActiveNode);

  if (currentKeys.length !== newKeys.length) { return false; }

  return newKeys.every(key => currentActiveNode[key] === newActiveNode[key]);
}

export default function activeNodeReducer(state = initialActiveNode, action) {
  console.log(`REDUCER: ${action.type}`);
  switch (action.type) {
    case notesListActionTypes.SELECT_NODE: {
      if (_equals(state, action.payload.activeNode)) { return state; }
      else { return { ...state, ...action.payload.activeNode }; }
    }

    case notesListActionTypes.NAVIGATE_PATH: {
      const newActiveNode = _changeActiveNodeOnPathNavClick({
        currentActive: state,
        idx: action.payload.idx,
      });

      if (_equals(state, newActiveNode)) { return state; }
      else { return newActiveNode; }
    }

    case notesListActionTypes.SWITCH_NODE_ON_DELETE: {
      const newActiveNode = _changeActiveNodeOnDelete({
        currentActive: state,
        deletedNode: action.payload.deletedNode,
      });

      if (_equals(state, newActiveNode)) { return state; }
      else { return newActiveNode; }
    }

    case notesListActionTypes.FETCH_NOTES_TREE_SUCCESS: {
      if (_equals(state, action.payload.activeNode)) { return state; }
      else { return { ...state, ...action.payload.activeNode }; }
    }

    default:
      if (process.env.REACT_APP_DEBUG) {
        console.log(`Current activeNode: ${JSON.stringify(state)}`);
      }
      return state;
  }
}

export const selectPath = (state) => state.path;
