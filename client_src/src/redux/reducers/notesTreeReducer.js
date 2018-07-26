import notesListActionTypes from '../actions/constants/notesListActionConstants';
import sampleNotes from '../../test/sample-tree';
import {
  changeNodeAtPath,
  removeNode,
} from 'react-sortable-tree';
import { getNodeKey } from '../../utils/tree-utils';

let initialNotesTree = sampleNotes;

function changeNodeTitle({ notesTree, title, node, path }) {
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

  // Find the newNode now part of the tree, which gives us its path and children, if any.
  // const matches = find({
  //   getNodeKey,
  //   treeData: changedTree,
  //   searchQuery: modifiedNode.id,
  //   searchMethod: ({ node, searchQuery }) => searchQuery === node.id,
  // }).matches;
  //
  // let newActiveNode = null;
  // if (matches.length) {
  //   newActiveNode = {
  //     id: matches[0].node.id,
  //     path: matches[0].path,
  //   };
  // }
  // nodeChangeHandler({ notesTree: changedTree, activeNode: newActiveNode });
}

function deleteNode({ notesTree, node, path }) {
  return removeNode({
    treeData: notesTree,
    getNodeKey,
    path,
  }).treeData;
}

export default function notesTreeReducer(state = initialNotesTree, action) {
  switch (action.type) {
    case notesListActionTypes.CHANGE_NOTES_TREE:
      console.log(`REDUCER: ${notesListActionTypes.CHANGE_NOTES_TREE}`);
      return action.payload.notesTree;
    case notesListActionTypes.CHANGE_NODE_TITLE:
      console.log(`REDUCER: ${notesListActionTypes.CHANGE_NODE_TITLE}`);
      return changeNodeTitle({
        notesTree: state,
        ...action.payload,
      });
    case notesListActionTypes.DELETE_NODE:
      console.log(`REDUCER: ${notesListActionTypes.DELETE_NODE}`);
      return deleteNode({
        notesTree: state,
        ...action.payload,
      });
    default:
      return state;
  }
}
