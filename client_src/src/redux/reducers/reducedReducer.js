import notesListActionTypes from '../actions/constants/notesListActionConstants';
import { getNodeAtPath, addNodeUnderParent } from 'react-sortable-tree';
import { getNodeKey, createNode } from '../../utils/treeUtils';
import baseState from '../misc/initialState';

const ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER;
const initialState = baseState;

/**
 * Returns the index of the deepest node of type 'folder' in path.
 * Returns null if none found.
 * @param path {Array}
 * @return {?number}
 * @private
 */
function _findFarthestParent(path) {
  if (!Array.isArray(path) || (path.length === 0)) {
    return null;
  }

  const lastStep = path[path.length - 1];
  if (path.length === 1) {
    return (lastStep.includes(`folder${ID_DELIMITER}`) ? 0 : null);
  } else {
    // If last step in path is not a folder, then the step previous to last must be a folder.
    return (lastStep.includes(`folder${ID_DELIMITER}`)) ? path.length - 1 : path.length - 2;
  }
}

/**
 * Switch to newly added node.
 * @param state
 * @param parentPath
 * @returns {{activeNode: {id: string, path: Array}}}
 * @private
 */
function _switchActiveNodeOnAdd({ state, parentPath }) {
  let newActiveNode = { id: '', path: [] };
  const children = getNodeAtPath({
    treeData: state.notesTree,
    path: parentPath,
    getNodeKey,
    ignoreCollapsed: false,
  }).node.children || [];

  if (children.length) {
    // The last child is the newly added node.
    newActiveNode.id = children[children.length - 1].id;
    newActiveNode.path = [...parentPath, newActiveNode.id];
  }

  return {
    ...state,
    activeNode: newActiveNode,
  };
}

/**
 * Create new node and switch to it
 * @param state
 * @param kind
 * @returns {{notesTree: *, activeNode: {id: *, path: Array}}}
 * @private
 */
function _addAndSelectNewNode({ state, kind }) {
  let newActiveNodePath = [];
  let parentKey = null;
  const newNode = createNode({ type: kind });
  const currentActivePath = state.activeNode.path;
  const parentIdx = _findFarthestParent(currentActivePath);

  // if parent found
  if (parentIdx !== null) {
    parentKey = currentActivePath[parentIdx];
    newActiveNodePath = [...currentActivePath.slice(0, parentIdx + 1), newNode.id];
  } else {
    parentKey = null;
    newActiveNodePath = [newNode.id];
  }

  const newNotesTree = addNodeUnderParent({
    treeData: state.notesTree,
    newNode,
    parentKey,
    getNodeKey,
    expandParent: true,
  }).treeData;

  const newActiveNode = {
    id: newNode.id,
    path: newActiveNodePath,
  };

  return {
    ...state,
    notesTree: newNotesTree,
    activeNode: newActiveNode,
  };
}

export default function reducedReducer(state = initialState, action) {
  switch (action.type) {
    case notesListActionTypes.SWITCH_NODE_ON_ADD:
      console.log(`REDUCER: ${notesListActionTypes.SWITCH_NODE_ON_ADD}`);
      return _switchActiveNodeOnAdd({
        state,
        parentPath: action.payload.path,
      });
    case notesListActionTypes.ADD_AND_SELECT_NODE:
      console.log(`REDUCER: ${notesListActionTypes.ADD_AND_SELECT_NODE}`);
      return _addAndSelectNewNode({
        state,
        kind: action.payload.kind,
      });
    default:
      if (process.env.REACT_APP_DEBUG) {
        console.log(`Current state tree: ${JSON.stringify(state)}`);
      }
      return state;
  }
}
