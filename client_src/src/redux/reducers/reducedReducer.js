import notesListActionTypes from '../actions/constants/notesListActionConstants';
import { addNodeUnderParent } from 'react-sortable-tree';
import { getNodeKey, createNode, translateNodeIdToInfo, findClosestParent } from '../../utils/treeUtils';
import baseState from '../misc/initialState';

const initialState = baseState;

/**
 * Create new node, switch to it and set editor content to blank page. The new node is added to the folder of the current active node, if no path was given.
 * @param state
 * @param kind
 * @param path {string[]}
 * @returns {{notesTree: *, activeNode: {id: *, path: Array}}}
 * @private
 */
function _addAndSelectNewNode({ state, kind, path = [] }) {
  let newState, currentActivePath;
  let newActiveNodePath = [];
  let parentKey = null;
  const newNode = createNode({ type: kind });

  if (Array.isArray(path) && path.length) {
    currentActivePath = path;
  } else {
    const end = state.activeNode.path.indexOf(state.activeNode.id) + 1;
    currentActivePath = state.activeNode.path.slice(0, end);
  }

  const parentIdx = findClosestParent(currentActivePath);

  // if parent found
  if (parentIdx !== null) {
    parentKey = currentActivePath[parentIdx];
    newActiveNodePath = [...currentActivePath.slice(0, parentIdx + 1), newNode.id];
  } else {
    parentKey = null;
    newActiveNodePath = [newNode.id];
  }

  const newNotesTree = {
    ...state.notesTree,
    tree: addNodeUnderParent({
      treeData: state.notesTree.tree,
      newNode,
      parentKey,
      getNodeKey,
      expandParent: true,
      ignoreCollapsed: false,
    }).treeData,
    dateModified: Date.now(),
  };

  const newActiveNode = {
    ...state.activeNode,
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
      id: newNode.uniqid,
      title: newNode.title,
      dateCreated: now,
      dateModified: now,
      readOnly: false,
    };
  }

  return newState;
}

export default function reducedReducer(state = initialState, action) {
  console.log(`REDUCER: ${action.type}`);
  switch (action.type) {
    case notesListActionTypes.ADD_AND_SELECT_NODE:
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
