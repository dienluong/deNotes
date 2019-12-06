import notesListActionTypes from '../actions/constants/notesListActionConstants';
import { changeNodeAtPath, removeNodeAtPath, find, getNodeAtPath } from 'react-sortable-tree';
import { getNodeKey, findDeepestFolder } from '../../utils/treeUtils';
import baseState from '../misc/initialState';
import { nodeTypes } from '../../utils/appCONSTANTS';

// Types
import { AnyAction } from 'redux';
import { TreeItem } from 'react-sortable-tree';

const initialTree: NotesTreeT = { ...baseState.notesTree };

function _changeNodeTitle({ notesTree, title, node, now }: { notesTree: NotesTreeT, title: string, node: TreeNodeT, now: number })
  : NotesTreeT {
  if (!node || (typeof node !== "object") || Array.isArray(node) || node.title === title) {
    return notesTree;
  }

  const nodesFound: Array<{ node: TreeItem, path: (string|number)[], treeIndex: number }> = find({
    getNodeKey,
    treeData: notesTree.tree,
    searchQuery: node.id,
    searchMethod: ({ node: treeNode, searchQuery }) => searchQuery === treeNode.id,
  }).matches;

  if (nodesFound.length) {
    const modifiedNode: TreeNodeT = { ...node, title };
    let newTree : NotesTreeT['tree'] = notesTree.tree;
    try {
      newTree = changeNodeAtPath({
        treeData: notesTree.tree,
        path: nodesFound[0].path,
        newNode: modifiedNode,
        getNodeKey,
        ignoreCollapsed: false,
      }) as TreeNodeT[];
    } catch(error) {
      return notesTree;
    }

    return {
      ...notesTree,
      tree: newTree,
      dateModified: now,
    };
  } else {
    return notesTree;
  }
}

function _deleteNode({ notesTree, now }: { notesTree: NotesTreeT, now: number })
  : NotesTreeT {
  if (!notesTree.editModeSelectedNodes.length) {
    return notesTree;
  }

  let changed = false;
  let modifiedTree: NotesTreeT['tree'] = notesTree.tree;
  const remainingSelectedNodes = notesTree.editModeSelectedNodes;

  for (let count = remainingSelectedNodes.length; count; count -= 1) {
    const idToDelete = remainingSelectedNodes.pop();
    const nodesFound: Array<{ node: TreeItem, path: (string|number)[], treeIndex: number }> = find({
      getNodeKey,
      treeData: modifiedTree,
      searchQuery: idToDelete,
      searchMethod: ({ node: treeNode, searchQuery }) => searchQuery === treeNode.id,
    }).matches;

    if (nodesFound.length) {
      try {
        modifiedTree = removeNodeAtPath({
          treeData: modifiedTree,
          path: nodesFound[0].path,
          getNodeKey,
          ignoreCollapsed: false,
        }) as TreeNodeT[];

        changed = true;
      } catch (error) {
        //TODO: handle error
      }
    }
  }

  return {
    ...notesTree,
    tree: modifiedTree,
    dateModified: changed ? now : notesTree.dateModified,
    editModeSelectedNodes: remainingSelectedNodes,
  };
}

function _changeTreeFolder({ notesTree, folder, activePath, now }: { notesTree: NotesTreeT, folder: TreeNodeT[], activePath: ActiveNodeT['path'], now: number })
  : NotesTreeT {
  const currentTreeData: NotesTreeT['tree'] = notesTree.tree;
  let newTreeData: NotesTreeT['tree'] = currentTreeData;

  if (!Array.isArray(folder)) {
    return notesTree;
  }
  const parentIdx: number|null = findDeepestFolder(activePath);
  if (parentIdx === null) {
    return notesTree;
  }
  // Parent is root; then the new folder is the entire root content, i.e. the new tree.
  if (parentIdx === -1) {
    newTreeData = folder;
  } else {
    const parentPath: ActiveNodeT['path'] = activePath.slice(0, parentIdx + 1);
    const parentNodeInfo = getNodeAtPath({
      getNodeKey,
      treeData: currentTreeData,
      path: parentPath,
      ignoreCollapsed: false,
    });

    if (parentNodeInfo && parentNodeInfo.node && parentNodeInfo.node.type === nodeTypes.FOLDER) {
      // create new parent node with the new folder as its children and change corresponding parent node on the tree
      const newParentNode = {...parentNodeInfo.node, children: folder};
      try {
        newTreeData = changeNodeAtPath({
          treeData: currentTreeData,
          path: parentPath,
          newNode: newParentNode,
          getNodeKey,
          ignoreCollapsed: false,
        }) as TreeNodeT[];
      } catch(error) {
        // if change of node failed
        return notesTree;
      }
    } else {
      // if parent node not found in tree
      return notesTree;
    }
  }

  return {
    ...notesTree,
    tree: newTreeData,
    dateModified: now,
  }
}

function _toggleSelected({ notesTree, nodeId, path }: { notesTree: NotesTreeT, nodeId: TreeNodeT['id'], path: TreeNodePathT })
  : NotesTreeT {
  const targetNodeInfo = getNodeAtPath({
    getNodeKey,
    treeData: notesTree.tree,
    path,
    ignoreCollapsed: false,
  });

  if (targetNodeInfo && targetNodeInfo.node && targetNodeInfo.node.id === nodeId) {
    const foundIdx = notesTree.editModeSelectedNodes.indexOf(nodeId);
    let newListSelectedNodes;
    if (foundIdx === -1) {
      newListSelectedNodes = [...notesTree.editModeSelectedNodes, nodeId];
    } else {
      notesTree.editModeSelectedNodes.splice(foundIdx, 1);
      newListSelectedNodes = [...notesTree.editModeSelectedNodes];
    }

    return {
      ...notesTree,
      editModeSelectedNodes: newListSelectedNodes,
    };
  } else {
    return notesTree;
  }
}

export default function notesTreeReducer(state: NotesTreeT = initialTree, action: AnyAction)
  : NotesTreeT {
  if (!action.payload) {
    action.type = '';
  }
  console.log(`REDUCER: '${action.type}'`);
  switch (action.type) {
    case notesListActionTypes.CHANGE_NOTES_TREE:
      return {
        ...state,
        ...action.payload.notesTree,
      };
    case notesListActionTypes.CHANGE_NODE_TITLE:
      return _changeNodeTitle({
        notesTree: state,
        ...action.payload,
      });
    case notesListActionTypes.DELETE_NODE:
      return _deleteNode({
        notesTree: state,
        ...action.payload,
      });
    case notesListActionTypes.CHANGE_NOTES_TREE_FOLDER:
      return _changeTreeFolder({
        notesTree: state,
        ...action.payload,
      });
    case notesListActionTypes.SET_EDIT_MODE:
      if (action.payload.value === state.editMode) {
        return state;
      } else {
        return {
          ...state,
          editMode: action.payload.value,
          editModeSelectedNodes: [],
        };
      }
    case notesListActionTypes.EDIT_MODE_SELECT_NODE:
      return _toggleSelected({
        notesTree: state,
        ...action.payload,
      });
    default:
      if (process.env.REACT_APP_DEBUG) {
        console.log(`Current notesTree: ${JSON.stringify(state)}`);
      }
      return state;
  }
}

export const selectTree = (state: NotesTreeT) => state.tree;
export const selectTreeId = (state: NotesTreeT) => state.id;
export const selectDateModified = (state: NotesTreeT) => state.dateModified;
export const selectDateCreated = (state: NotesTreeT) => state.dateCreated;
export const selectEditMode = (state: NotesTreeT) => state.editMode;
export const selectEditModeSelectedNodes = (state: NotesTreeT) => state.editModeSelectedNodes;
