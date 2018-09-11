import notesListActionTypes from '../actions/constants/notesListActionConstants';
import { addNodeUnderParent } from 'react-sortable-tree';
import { getNodeKey, createNode, translateNodeIdToInfo } from '../../utils/treeUtils';
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
 * Create new node, switch to it and set editor content to blank page.
 * @param state
 * @param kind
 * @param path {string[]}
 * @returns {{notesTree: *, activeNode: {id: *, path: Array}}}
 * @private
 */
function _addAndSelectNewNode({ state, kind, path = [] }) {
  let newState = null;
  let newActiveNodePath = [];
  let parentKey = null;
  const newNode = createNode({ type: kind });
  const currentActivePath = (Array.isArray(path) && path.length) ? path : state.activeNode.path;
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

  newState = {
    ...state,
    notesTree: newNotesTree,
    activeNode: newActiveNode,
  };

  // Only change the editorContent state if newly added node is a note, as opposed to a folder.
  if (kind === 'item') {
    const now = Date.now();
    newState.editorContent = {
      ...initialState.editorContent,
      id: translateNodeIdToInfo({ nodeId: newActiveNode.id, kind: 'uniqid' }),
      title: newNode.title,
      dateCreated: now,
      dateModified: now,
      readOnly: false,
    };
  }

  return newState;
}

export default function reducedReducer(state = initialState, action) {
  switch (action.type) {
    case notesListActionTypes.ADD_AND_SELECT_NODE:
      console.log(`REDUCER: ${notesListActionTypes.ADD_AND_SELECT_NODE}`);
      return _addAndSelectNewNode({
        state,
        kind: action.payload.kind,
        path: action.payload.path,
      });
    default:
      if (process.env.REACT_APP_DEBUG) {
        console.log(`Current state tree: ${JSON.stringify(state)}`);
      }
      return state;
  }
}
