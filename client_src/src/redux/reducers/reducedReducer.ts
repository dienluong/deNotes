import notesListActionTypes from '../actions/constants/notesListActionConstants';
import { addNodeUnderParent } from 'react-sortable-tree';
import { getNodeKey, createNode, findClosestParent } from '../../utils/treeUtils';
import baseState from '../misc/initialState';

// Types
import { AnyAction } from "redux";

const initialState = baseState;

/**
 * Create new node, switch to it and set editor content to blank page. The new node is added to the folder of the current active node, if no path was given.
 * @param state
 * @param kind
 * @param path {string[]}
 * @returns {{notesTree: *, activeNode: {id: *, path: Array}}}
 * @private
 */
function _addAndSelectNewNode({ state, kind, path = [] }: { state: AppStateT, kind: NodeTypeT, path: string[] })
  : AppStateT {
  let newState, currentActivePath;
  let newActiveNodePath = [];
  let parentKey = null;
  const newNode = createNode({ type: kind });

  if (Array.isArray(path) && path.length) {
    currentActivePath = path;
  } else {
    // The below manipulation is necessary because the the active node is not necessarily at the very end of the active path
    // This is because with the path navigator, we can have the active node anywhere in the active path. But this feature will be removed.
    // TODO: The active node must always be at the very end of the active path.
    const end = state.activeNode.path.indexOf(state.activeNode.id);
    currentActivePath = state.activeNode.path.slice(0, end + 1);
  }

  const parentIdx = findClosestParent(currentActivePath);

  // if parent found
  if (parentIdx !== null) {
    parentKey = currentActivePath[parentIdx];
    newActiveNodePath = [...currentActivePath.slice(0, parentIdx + 1), newNode.id];
  } else {
    // If no parent found, then default to the root folder
    parentKey = state.activeNode.path[0];
    newActiveNodePath = [parentKey, newNode.id];
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

function _changeTreeBranch({ state, branch }: { state: AppStateT, branch: Array<TreeNodeT> })
  : AppStateT {
  // TODO To implement
  window.alert('TODO!!!');
  return state;
}

export default function reducedReducer(state: AppStateT = initialState, action: AnyAction)
  : AppStateT {
  console.log(`REDUCER: ${action.type}`);
  switch (action.type) {
    case notesListActionTypes.ADD_AND_SELECT_NODE:
      return _addAndSelectNewNode({
        state,
        kind: action.payload.kind,
        path: action.payload.path,
      });
    case notesListActionTypes.CHANGE_NOTES_TREE_BRANCH:
      return _changeTreeBranch({
        state,
        ...action.payload,
      });
    default:
      if (process.env.REACT_APP_DEBUG) {
        console.log(`Current state tree: ${JSON.stringify(state)}`);
      }
      return state;
  }
}
