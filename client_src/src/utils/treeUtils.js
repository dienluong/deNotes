import uuid from 'uuid/v1';
import { find } from 'react-sortable-tree';
const ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER;

export const getNodeKey = ({ node }) => node.id;

/**
 * Builds a node for a tree.
 * 'uniqid' is a unique ID usually used as a key when storing in a database.
 * 'id' is the combo of type+uniqid; it is the ID used for react-sortable-tree (in the 'path' it returns for example). The node type is included in order to efficiently determine the type of node when we only have its ID.
 * @param title
 * @param subtitle
 * @param type
 * @return {*}
 */
export function createNode({ title = 'New Note', subtitle = new Date().toLocaleString(), type = 'item' }) {
  const newNode = {
    title,
    subtitle,
    type,
    uniqid: uuid(),
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
 * For each entry in path, return the specified kind of info
 * @param notesTree {!Object[]}
 * @param path {Array}
 * @param kind {string}
 * @return {Array}
 * @private
 */
export function translatePathToInfo({ notesTree = [], path = [], kind = 'type' }) {
  let info = [];
  if (!Array.isArray(path) || !path.length) {
    return info;
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
      info = path.map((step) => String(step).split(ID_DELIMITER));
      return info[0] ? [info[0]] : [];
    case 'uniqid':
      info = path.map((step) => String(step).split(ID_DELIMITER));
      return info[1] ? [info[1]] : [];
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
