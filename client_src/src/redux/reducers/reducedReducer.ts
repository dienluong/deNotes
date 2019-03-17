import notesListActionTypes from '../actions/constants/notesListActionConstants';
import { addNodeUnderParent } from 'react-sortable-tree';
import { getNodeKey } from '../../utils/treeUtils';
import initialState from '../misc/initialState';

// Types
import { AnyAction } from "redux";

/**
 * Create new node, switch to it and set editor content to blank page. The new node is added to the folder of the current active node.
 * @param state {AppStateT}
 * @param newNode {TreeNodeT}
 * @param parentKey {string} If empty string, new node will be added to root folder.
 * @param now {number}
 * @returns {{notesTree: *, activeNode: {id: *, path: Array}}}
 * @private
 */
function _addAndSelectNewNode({ state, newNode, parentKey, now }: { state: AppStateT, newNode: TreeNodeT, parentKey: string, now: number })
  : AppStateT {
  let newTreeData: NotesTreeT['tree'];

  if (typeof parentKey !== 'string') {
    return state;
  }

  // Explicitly set parent key to undefined instead of null due to how addNodeUnderParent() is annotated in TypeScript
  // A parentKey of undefined (or null) tells addNodeUnderParent() to put new node in root of tree
  const _parentKey = !parentKey ? undefined : parentKey;

  try {
    newTreeData = addNodeUnderParent({
      treeData: state.notesTree.tree,
      newNode,
      parentKey: _parentKey,
      getNodeKey,
      expandParent: true,
      ignoreCollapsed: false,
    }).treeData as TreeNodeT[];
  } catch(error) {
    // if adding of node failed, return state unchanged
    return state;
  }

  const newNotesTree: NotesTreeT = {
    ...state.notesTree,
    tree: newTreeData,
    dateModified: now,
  };

  return {
    ...state,
    notesTree: newNotesTree,
  };
}

export default function reducedReducer(state: AppStateT = initialState, action: AnyAction)
  : AppStateT {
  if (!action.payload) {
    action.type = '';
  }
  console.log(`REDUCER: '${action.type}'`);
  switch (action.type) {
    case notesListActionTypes.ADD_NODE:
      return _addAndSelectNewNode({
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
