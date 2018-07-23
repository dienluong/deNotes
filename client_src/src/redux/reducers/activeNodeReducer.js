import notesListActionTypes from '../actions/constants/notesListActionConstants';

let initialActiveNode = {
  id: null,
  path: [],
};

function changeActiveNodeOnPathNavClick({ currentActive, idx }) {
  let newActiveNode = currentActive;
  if (Number.isSafeInteger(idx) && idx < currentActive.path.length) {
    newActiveNode = {
      id: currentActive.path[idx],
      path: currentActive.path.slice(0, idx + 1),
    };
  }
  return newActiveNode;
}

export default function activeNodeReducer(state = initialActiveNode, action) {
  switch (action.type) {
    case notesListActionTypes.CHANGE_ACTIVE_NODE:
      console.log(`REDUCER: ${notesListActionTypes.CHANGE_ACTIVE_NODE}`);
      return {
        id: action.payload.activeNode.id,
        path: action.payload.activeNode.path,
      };
    case notesListActionTypes.NAVIGATE_TO_NODE:
      console.log(`REDUCER: ${notesListActionTypes.NAVIGATE_TO_NODE}`);
      return changeActiveNodeOnPathNavClick({
        currentActive: state,
        idx: action.payload.idx,
      });
    default:
      return state;
  }
}
