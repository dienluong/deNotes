import notesListActionTypes from '../actions/constants/notesListActionConstants';
import { getNodeAtPath } from 'react-sortable-tree';
import { getNodeKey } from '../../utils/tree-utils';


function switchActiveNodeOnAdd({ state, parentPath }) {
  let newActiveNode = { id: null, path: [] };
  const children = getNodeAtPath({
    treeData: state.notesTree,
    path: parentPath,
    getNodeKey,
    ignoreCollapsed: false,
  }).node.children || [];

  if (children.length) {
    newActiveNode.id = children[children.length - 1].id;
    newActiveNode.path = [...parentPath, newActiveNode.id];
  }

  let newState = {
    ...state,
    activeNode: newActiveNode,
  };
  console.log(newState);
  return newState;
}

export default function reducedReducer(state = {}, action) {
  switch (action.type) {
    case notesListActionTypes.SWITCH_NODE_ON_ADD:
      console.log(`REDUCER: ${notesListActionTypes.SWITCH_NODE_ON_ADD}`);
      return switchActiveNodeOnAdd({
        state,
        parentPath: action.payload.path,
      });
    default:
      return state;
  }
}
