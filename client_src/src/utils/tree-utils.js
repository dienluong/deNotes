import uuid from 'uuid/v1';
import { find } from 'react-sortable-tree';
const ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER;

export const getNodeKey = ({ node }) => node.id;
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
