import notesListActionTypes from '../actions/constants/notesListActionConstants';
import { changeNodeAtPath, removeNodeAtPath, find, getNodeAtPath } from 'react-sortable-tree';
import { getNodeKey, findDeepestFolder } from '../../utils/treeUtils';
import baseState from '../misc/initialState';
import { nodeTypes } from '../../utils/appCONSTANTS';

// Types
import { AnyAction } from 'redux';
import { TreeItem } from 'react-sortable-tree';

const initialTree = baseState.notesTree;

function _changeNodeTitle({ notesTree, title, node, now }: { notesTree: NotesTreeT, title: string, node: TreeNodeT, now: number })
  : NotesTreeT {
  if (!node || (typeof node !== "object") || Array.isArray(node)) {
    return notesTree;
  }

  const nodesFound: Array<{ node: TreeItem, path: (string|number)[], treeIndex: number }> = find({
    getNodeKey,
    treeData: notesTree.tree,
    searchQuery: node.id,
    searchMethod: ({ node: treeNode, searchQuery }) => searchQuery === treeNode.id,
  }).matches;

  if (nodesFound.length) {
    // Cannot use _createNode for creating a new node (with a new ID) as it is breaking the tree.
    // This is because react-sortable-tree treats it as a new standalone node due to new ID (not reusing the ID of the old node)
    // So using { ...node, title } to keep the ID intact and only change the title
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

    // TODO: remove
    console.log(`>>>>> Submitted title: ${ title } ; node.type: ${ node.type } ;`);
    console.log('-->Tree changed on node title change\n');

    return {
      ...notesTree,
      tree: newTree,
      dateModified: now,
    };
  } else {
    return notesTree;
  }
}

function _deleteNode({ notesTree, nodeToDelete, now }: { notesTree: NotesTreeT, nodeToDelete: TreeNodeT, now: number })
  : NotesTreeT {
  const nodesFound: Array<{ node: TreeItem, path: (string|number)[], treeIndex: number }> = find({
    getNodeKey,
    treeData: notesTree.tree,
    searchQuery: nodeToDelete.id,
    searchMethod: ({ node: treeNode, searchQuery }) => searchQuery === treeNode.id,
  }).matches;

  // TODO Remove
  // const parentFolderIdx: number | null = findDeepestFolder(activePath);
  // let nodeToDeletePath: ActiveNodeT['path'];
  // if (parentFolderIdx !== null) {
  //   nodeToDeletePath = [...activePath.slice(0, parentFolderIdx + 1), nodeToDelete.id];
  // } else {
  //   return notesTree;
  // }

  if (nodesFound.length) {
    let newTree: NotesTreeT['tree'] = notesTree.tree;
    try {
      newTree = removeNodeAtPath({
        treeData: notesTree.tree,
        path: nodesFound[0].path,
        getNodeKey,
        ignoreCollapsed: false,
      }) as TreeNodeT[];
    } catch (error) {
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
