import notesListActionTypes from '../actions/constants/notesListActionConstants';
import {
  changeNodeAtPath,
  removeNode,
} from 'react-sortable-tree';
import { getNodeKey } from '../../utils/treeUtils';
import baseState from '../misc/initialState';

const initialTree = baseState.notesTree;

function _changeNodeTitle({ notesTree, title, node, path }) {
  console.log(`>>>>> Submitted title: ${ title } ; node.type: ${ node.type } ;`);

  // TODO? Must use a map structure to map the ID to the corresponding node title
  // Cannot use _createNode for creating a new node (with a new ID) as it is breaking the tree.
  // This is because react-sortable-tree treats it as a new standalone node due to new ID (not reusing the ID of the old node)
  // So using { ...node, title } to keep the ID intact and only change the title
  const modifiedNode = { ...node, title };

  console.log('-->Tree changed on node title change\n');

  const newTree = changeNodeAtPath({
    treeData: notesTree,
    path,
    newNode: modifiedNode,
    getNodeKey,
  });

  return newTree || notesTree;
}

function _deleteNode({ notesTree, node, path }) {
  return removeNode({
    treeData: notesTree,
    getNodeKey,
    path,
  }).treeData;
}

export default function notesTreeReducer(state = initialTree, action) {
  console.log(`REDUCER: ${action.type}`);
  switch (action.type) {
    case notesListActionTypes.CHANGE_NOTES_TREE:
      return action.payload.notesTree;
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
    case notesListActionTypes.FETCH_NOTES_TREE_SUCCESS:
      return action.payload.notesTree;
    default:
      if (process.env.REACT_APP_DEBUG) {
        console.log(`Current notesTree: ${JSON.stringify(state)}`);
      }
      return state;
  }
}
