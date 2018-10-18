import uuid from 'uuid/v4';
import { find, getFlatDataFromTree } from 'react-sortable-tree';

const ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER;

/**
 * Deep comparison of objects (including arrays).
 * @param obj1
 * @param obj2
 * @return {boolean}
 * @private
 */
export function equals(obj1, obj2) {
  if ((typeof obj1 !== 'object') || (typeof obj2 !== 'object')) {
    return Object.is(obj1, obj2);
  }

  if (obj1 === null || obj2 === null) {
    return obj1 === obj2;
  }

  const currentKeys = Object.keys(obj1);
  const newKeys = Object.keys(obj2);

  if (currentKeys.length !== newKeys.length) { return false; }

  return newKeys.every(key => {
    const currentVal = obj1[key];
    const newVal = obj2[key];

    return equals(currentVal, newVal);
  });
}

export const getNodeKey = ({ node }) => node.id;

/**
 * Builds a node for a tree.
 * 'uniqid' is a unique ID usually used as a key when storing in a database.
 * 'id' is the combo of type+uniqid; it is the ID used for react-sortable-tree (in the 'path' it returns for example). The node type is included in order to efficiently determine the type of node when we only have its ID.
 * @param {string} title
 * @param {string} subtitle
 * @typedef {("item" | "folder")} NodeType
 * @param {NodeType} type
 * @return {*}
 */
export function createNode({ title = 'New Note', subtitle = new Date().toLocaleString(), type = 'item' }) {
  // TODO: remove subtitle = uuid
  const id = uuid();
  const newNode = {
    title,
    subtitle: id,
    type,
    uniqid: id,
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

/**
 * Returns the index of the deepest node of type 'folder' in path.
 * Returns null if none found.
 * @param path {Array}
 * @return {?number}
 * @private
 */
export function findClosestParent(path) {
  if (!Array.isArray(path) || !path.length) {
    return null;
  }

  const lastStep = path[path.length - 1];
  if (path.length === 1) {
    return (lastStep.includes(`folder${ID_DELIMITER}`) ? 0 : null);
  } else {
    // If last step in path is not a folder, then the step previous to last must be a folder.
    return (lastStep.includes(`folder${ID_DELIMITER}`)) ? path.length - 1 : path.length - 2;
  }
}

/**
 * Return the info embedded in provided ID.
 * Example: For ID "folder|^|a9914200-a7d2-11e8-a12b-99205b853de7"
 *          type is "folder"
 *          uniqid is "a9914200-a7d2-11e8-a12b-99205b853de7""
 *
 * Note: possible types are "item" and "folder".
 * @param {string} nodeId
 * @param {("uniqid"|"type")} kind
 */
export function translateNodeIdToInfo({ nodeId, kind = 'uniqid' }) {
  if (typeof nodeId !== 'string') {
    return '';
  }

  switch (kind) {
    case 'type':
      return nodeId.split(ID_DELIMITER)[0];
    case 'uniqid':
      return nodeId.split(ID_DELIMITER)[1];
    default:
      return '';
  }
}

/**
 * For each entry in path, return the specified kind of info.
 * @param notesTree {!Object[]}
 * @param path {Array}
 * @param kind {string}
 * @return {Array}
 * @private
 */
export function translatePathToInfo({ notesTree = [], path = [], kind = 'type' }) {
  if (!Array.isArray(path) || !path.length) {
    return [];
  }

  switch (kind) {
    case 'title':
      return path.map((id) => {
        const matches = find({
          getNodeKey,
          treeData: notesTree,
          searchQuery: id,
          searchMethod: ({ node, searchQuery }) => searchQuery === node.id,
        }).matches;
        return matches.length ? matches[0].node.title : '';
      });
    case 'type':
      return path.map((step) => String(step).split(ID_DELIMITER)[0]);
    case 'uniqid':
      return path.map((step) => String(step).split(ID_DELIMITER)[1]);
    default:
      return [];
  }
}

/**
 * Keep only uniqid and children properties of nodes.
 * @param tree
 * @returns {*}
 */
// TODO To remove
// https://stackoverflow.com/questions/41312228/filter-nested-tree-object-without-losing-structure
export function trimTree(tree) {
  if (!Array.isArray(tree)) {
    return [];
  }

  return tree.map(node => {
    const normNode = {
      uniqid: node.uniqid,
    };

    if (Array.isArray(node.children)) {
      if (node.children.length !== 0) {
        normNode.children = trimTree(node.children);
      } else {
        normNode.children = [];
      }
    }

    return normNode;
  });
}

/**
 * Returns an array of all the node's descendants.
 * @param node {Object}
 * @returns {Array}
 */
export function getDescendants({ node }) {
  if (typeof node !== 'object') {
    return [];
  }

  return getFlatDataFromTree({ treeData: [node], getNodeKey, ignoreCollapsed: false }).map(data => data.node);
}

export function getDescendantItems({ node }) {
  return getDescendants({ node }).filter(descendant => descendant.type === 'item');
}

export function getDescendantFolders({ node }) {
  return getDescendants({ node }).filter(descendant => descendant.type === 'folder');
}
