import notesListActionTypes from '../actions/constants/notesListActionConstants';
import initialNotesTree from '../../test/sample-tree';
import {
  changeNodeAtPath,
  removeNode,
  addNodeUnderParent,
} from 'react-sortable-tree';
import uniqid from 'uniqid';
import { getNodeKey } from '../../utils/tree-utils';

// TODO: Define these in a env config file.
const ID_DELIMITER = '|^|';

function _createNode({
  title = 'New Note',
  subtitle = new Date().toLocaleString(),
  type = 'item',
}) {
  const newNode = {
    title,
    subtitle,
    type,
    uniqid: uniqid(),
    get id() {
      return `${this.type}${ID_DELIMITER}${this.uniqid}`;
    },
  };

  if (type === 'folder') {
    newNode.children = [];
    newNode.title = title === 'New Note' ? 'New Folder' : title;
  }

  return newNode;
}


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
}

function deleteNode({ notesTree, node, path }) {
  return removeNode({
    treeData: notesTree,
    getNodeKey,
    path,
  }).treeData;
}

function addNode({ notesTree, path }) {
  const newNode = _createNode({});
  return addNodeUnderParent({
    treeData: notesTree,
    getNodeKey,
    parentKey: path[path.length - 1],
    newNode,
    expandParent: true,
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
    case notesListActionTypes.ADD_NODE:
      console.log(`REDUCER: ${notesListActionTypes.ADD_NODE}`);
      return addNode({
        notesTree: state,
        ...action.payload,
      });
    default:
      return state;
  }
}
