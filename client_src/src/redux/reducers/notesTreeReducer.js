import notesListActionTypes from '../actions/constants/notesListActionConstants';
import {
  changeNodeAtPath,
  removeNode,
} from 'react-sortable-tree';
import { getNodeKey } from '../../utils/treeUtils';
import baseState from '../misc/initialState';

const initialTree = baseState.notesTree;

function _changeNodeTitle({ notesTree, title, node, path }) {
  // TODO: remove
  console.log(`>>>>> Submitted title: ${ title } ; node.type: ${ node.type } ;`);
  console.log('-->Tree changed on node title change\n');

  // TODO? Must use a map structure to map the ID to the corresponding node title
  // Cannot use _createNode for creating a new node (with a new ID) as it is breaking the tree.
  // This is because react-sortable-tree treats it as a new standalone node due to new ID (not reusing the ID of the old node)
  // So using { ...node, title } to keep the ID intact and only change the title
  const modifiedNode = { ...node, title };

  const newTree = changeNodeAtPath({
    treeData: notesTree.tree,
    path,
    newNode: modifiedNode,
    getNodeKey,
  });

  return {
    ...notesTree,
    tree: newTree || notesTree.tree,
    dateModified: Date.now(),
  };
}

function _deleteNode({ notesTree, node, path }) {
  const newTree = removeNode({
    treeData: notesTree.tree,
    getNodeKey,
    path,
  }).treeData;

  return {
    ...notesTree,
    tree: newTree || notesTree.tree,
    dateModified: Date.now(),
  };
}

export default function notesTreeReducer(state = initialTree, action) {
  console.log(`REDUCER: ${action.type}`);
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
    default:
      if (process.env.REACT_APP_DEBUG) {
        console.log(`Current notesTree: ${JSON.stringify(state)}`);
      }
      return state;
  }
}

export const selectTree = (state) => state.tree;
export const selectTreeId = (state) => state.id;
export const selectDateModified = (state) => state.dateModified;
export const selectDateCreated = (state) => state.dateCreated;
