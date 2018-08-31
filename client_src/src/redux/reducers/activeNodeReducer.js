import notesListActionTypes from '../actions/constants/notesListActionConstants';
import baseState from '../misc/initialState';

const initialActiveNode = baseState.activeNode;

function changeActiveNodeOnPathNavClick({ currentActive, idx }) {
  let newActiveNode = currentActive;
  if (Number.isSafeInteger(idx) && idx < currentActive.path.length) {
    newActiveNode = {
      id: currentActive.path[idx],
      // path: currentActive.path.slice(0, idx + 1),
      path: currentActive.path,
    };
  }
  return newActiveNode;
}

function changeActiveNodeOnDelete({ currentActive, deletedNode }) {
  let newActiveNode = currentActive;
  // if deleted node is part of the active path, re-adjust the active node
  const deletedNodeIdx = currentActive.path.lastIndexOf(deletedNode.id);
  if (deletedNodeIdx >= 0) {
    const newActivePath = currentActive.path.slice(0, deletedNodeIdx);
    if (newActivePath.length) {
      newActiveNode = {
        id: newActivePath[newActivePath.length - 1],
        path: newActivePath,
      };
    } else {
      newActiveNode = {
        id: null,
        path: [],
      };
    }
  }

  return newActiveNode;
}

export default function activeNodeReducer(state = initialActiveNode, action) {
  switch (action.type) {
    case notesListActionTypes.SELECT_NODE:
      console.log(`REDUCER: ${notesListActionTypes.SELECT_NODE}`);
      return action.payload.activeNode;
    case notesListActionTypes.NAVIGATE_PATH:
      console.log(`REDUCER: ${notesListActionTypes.NAVIGATE_PATH}`);
      return changeActiveNodeOnPathNavClick({
        currentActive: state,
        idx: action.payload.idx,
      });
    case notesListActionTypes.SWITCH_NODE_ON_DELETE:
      console.log(`REDUCER: ${notesListActionTypes.SWITCH_NODE_ON_DELETE}`);
      return changeActiveNodeOnDelete({
        currentActive: state,
        deletedNode: action.payload.deletedNode,
      });
    case notesListActionTypes.FETCH_NOTES_TREE_SUCCESS:
      console.log(`REDUCER: ${notesListActionTypes.FETCH_NOTES_TREE_SUCCESS}`);
      return action.payload.activeNode;
    default:
      console.log(`Current activeNode: ${JSON.stringify(state)}`);
      return state;
  }
}
