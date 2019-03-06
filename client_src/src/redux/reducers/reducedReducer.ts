import notesListActionTypes from '../actions/constants/notesListActionConstants';
import { addNodeUnderParent } from 'react-sortable-tree';
import { getNodeKey, createNode, translateNodeIdToInfo, equals } from '../../utils/treeUtils';
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
  let parentPath: ActiveNodeT['path'];
  if (equals(state.activeNode.path, [NONE_SELECTED])){
    // case where active node is root folder (i.e. active ID = NONE_SELECTED and path = [NONE_SELECTED])
    parentPath = [];
  } else {
    const activeNodeInfo = translateNodeIdToInfo({nodeId: state.activeNode.id});
    if (activeNodeInfo && activeNodeInfo.type === nodeTypes.FOLDER) {
      parentPath = state.activeNode.path;
    } else {
      // If current active node is not a FOLDER, simply truncate its path to obtain the parent path.
      parentPath = state.activeNode.path.slice(0, -1);
    }
  }

  const newNode: TreeNodeT = createNode({ type: kind });
  let newActiveNodePath: ActiveNodeT['path'] = [...parentPath, newNode.id];
  let newActiveNodeId: ActiveNodeT['id'] = newNode.id;

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
