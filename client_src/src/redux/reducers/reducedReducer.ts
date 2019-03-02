import notesListActionTypes from '../actions/constants/notesListActionConstants';
import { addNodeUnderParent } from 'react-sortable-tree';
import { getNodeKey, createNode } from '../../utils/treeUtils';
import { nodeTypes, NONE_SELECTED } from '../../utils/appCONSTANTS';
import initialState from '../misc/initialState';

// Types
import { AnyAction } from "redux";

/**
 * Create new node, switch to it and set editor content to blank page. The new node is added to the folder of the current active node.
 * @param state
 * @param kind
 * @param now {number}
 * @returns {{notesTree: *, activeNode: {id: *, path: Array}}}
 * @private
 */
function _addAndSelectNewNode({ state, kind, now }: { state: AppStateT, kind: NodeTypeT, now: number })
  : AppStateT {
  const parentPath: ActiveNodeT['path'] = state.activeNode.path.slice(0, -1);
  const newNode: TreeNodeT = createNode({ type: kind });

  let newActiveNodePath: ActiveNodeT['path'];
  let newActiveNodeId: ActiveNodeT['id'];
  if (kind === nodeTypes.ITEM) {
    newActiveNodePath = [...parentPath, newNode.id];
    newActiveNodeId = newNode.id;
  } else {
    newActiveNodePath = [...parentPath, newNode.id, NONE_SELECTED];
    newActiveNodeId = NONE_SELECTED;
  }

  let parentKey: string|null|undefined = null;
  if (parentPath.length) {
    parentKey = parentPath[parentPath.length - 1];
  } else {
    // If path to parent node is [], then it means the active node is at the very root of the tree.
    // Explicitly set parent key to undefined instead of null due to how addNodeUnderParent() is annotated in TypeScript
    // A parentKey of null (or undefined) tells addNodeUnderParent() to put new node in root of tree
    parentKey = undefined;
  }

  let newTreeData: NotesTreeT['tree'];
  try {
    newTreeData = addNodeUnderParent({
      treeData: state.notesTree.tree,
      newNode,
      parentKey,
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

  const newActiveNode: ActiveNodeT = {
    ...state.activeNode,
    id: newActiveNodeId,
    path: newActiveNodePath,
  };

  const newState: AppStateT = {
    ...state,
    notesTree: newNotesTree,
    activeNode: newActiveNode,
  };

  // Only change the editorContent state if newly added node is a note, as opposed to a folder.
  if (kind === nodeTypes.ITEM) {
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

export default function reducedReducer(state: AppStateT = initialState, action: AnyAction)
  : AppStateT {
  if (!action.payload) {
    action.type = '';
  }
  console.log(`REDUCER: '${action.type}'`);
  switch (action.type) {
    case notesListActionTypes.ADD_AND_SELECT_NODE:
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
