import notesListActionTypes from '../actions/constants/notesListActionConstants';
import { addNodeUnderParent } from 'react-sortable-tree';
import { getNodeKey, createNode, findClosestParent } from '../../utils/treeUtils';
import initialState from '../misc/initialState';

// Types
import { AnyAction } from "redux";

/**
 * Create new node, switch to it and set editor content to blank page. The new node is added to the folder of the current active node, if no path was given.
 * @param state
 * @param kind
 * @param path {string[]}
 * @returns {{notesTree: *, activeNode: {id: *, path: Array}}}
 * @private
 */
function _addAndSelectNewNode({ state, kind, now }: { state: AppStateT, kind: NodeTypeT, now: number })
  : AppStateT {
  let newActiveNodePath: ActiveNodeT["path"] = [];
  let parentKey: string|null = null;

  const newNode: TreeNodeT = createNode({ type: kind });
  const currentActivePath: ActiveNodeT["path"] = state.activeNode.path;
  const parentIdx: number|null = findClosestParent(currentActivePath);

  // if parent found
  if (parentIdx !== null) {
    parentKey = currentActivePath[parentIdx];
    newActiveNodePath = [...(currentActivePath.slice(0, parentIdx + 1)), newNode.id];
  } else {
    // If no parent found, then default to the root folder
    // This could happen with a brand new empty tree.
    parentKey = state.notesTree.tree[0].id;
    newActiveNodePath = [parentKey, newNode.id];
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
    id: newNode.id,
    path: newActiveNodePath,
  };

  const newState: AppStateT = {
    ...state,
    notesTree: newNotesTree,
    activeNode: newActiveNode,
  };

  // Only change the editorContent state if newly added node is a note, as opposed to a folder.
  if (kind === 'item') {
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

// function _changeTreeBranch({ state, branch }: { state: AppStateT, branch: TreeNodeT[] })
//   : AppStateT {
//   // TODO To implement
//   window.alert('TODO!!!');
//
//   if (!branch.length) {
//     return state;
//   }
//
//   const currentTree: NotesTreeT['tree'] = state.notesTree.tree;
//   const currentActivePath: ActiveNodeT['path'] = state.activeNode.path;
//   const parentIdx: number|null = findClosestParent(currentActivePath);
//   if (parentIdx === null) {
//     return state;
//   }
//   const parentPath: ActiveNodeT['path'] = currentActivePath.slice(0, parentIdx + 1);
//   const parentNodeInfo = getNodeAtPath({
//     getNodeKey,
//     treeData: currentTree,
//     path: parentPath,
//     ignoreCollapsed: false,
//   });
//
//   let newTree: NotesTreeT['tree'] = currentTree;
//   if (parentNodeInfo && parentNodeInfo.node && parentNodeInfo.node.type === 'folder') {
//     const newNode = { ...parentNodeInfo.node, children: branch };
//     newTree = changeNodeAtPath({
//       treeData: currentTree,
//       path: parentPath,
//       newNode,
//       getNodeKey,
//       ignoreCollapsed: false,
//     }) as TreeNodeT[];
//   } else {
//     return state
//   }
//
//   return {
//     ...state,
//     notesTree: {
//       ...state.notesTree,
//       tree: newTree,
//       dateModified: Date.now(),
//     }
//   }
// }

// function _switchActiveNodeOnBranchChange({ state, branch }: { state: AppStateT, branch: TreeNodeT[] } )
//   : AppStateT {
//   // If active node no longer present after branch changed, switch active node to first child of the branch
//   if (!getNodeAtPath({ treeData: state.notesTree.tree, path: state.activeNode.path, getNodeKey, ignoreCollapsed: false })) {
//     const currentActivePath: ActiveNodeT['path'] = state.activeNode.path;
//     const parentIdx: number|null = findClosestParent(currentActivePath);
//     if (parentIdx === null) {
//       return state;
//     }
//     const parentPath: ActiveNodeT['path'] = currentActivePath.slice(0, parentIdx + 1);
//     const newActiveNode: ActiveNodeT = { ...state.activeNode };
//     newActiveNode.id = branch[0].id;
//     newActiveNode.path = [...parentPath, newActiveNode.id];
//     return {
//       ...state,
//       activeNode: newActiveNode,
//     };
//   }
//
//   return state;
// }

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
