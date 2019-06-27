import uuid from 'uuid/v4';
import { find, getFlatDataFromTree } from 'react-sortable-tree';
import { nodeTypes } from './appCONSTANTS';

// Types
import { GetNodeKeyFunction, NodeData } from 'react-sortable-tree';

const ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER || '|^|';
const DEFAULT_TITLES = {
  FOLDER: 'New Folder',
  NOTE: 'New Note',
};

export const getNodeKey: GetNodeKeyFunction = ({ node }) => node.id;

/**
 * Deep comparison of objects (including arrays).
 * @param obj1
 * @param obj2
 * @return {boolean}
 * @private
 */
export function equals(obj1: { [key: string]: any }, obj2: { [key: string]: any })
  : boolean {
  if ((typeof obj1 !== 'object') || (typeof obj2 !== 'object')) {
    return Object.is(obj1, obj2);
  }

  if (obj1 === null || obj2 === null) {
    return obj1 === obj2;
  }

  // If same object
  if (obj1 === obj2) {
    return true;
  }

  const currentKeys = Object.keys(obj1);
  const newKeys = Object.keys(obj2);

  if (currentKeys.length !== newKeys.length) { return false; }

  return newKeys.every((key: string) => {
    const currentVal = (obj1[key] as any);
    const newVal = obj2[key];

    return equals(currentVal, newVal);
  });
}

/**
 * Builds a node for a tree.
 * 'uniqid' is a unique ID usually used as a key when storing in a database.
 * 'id' is the combo of type+uniqid; it is the ID used for react-sortable-tree (in the 'path' it returns for example). The node type is included in order to efficiently determine the type of node when we only have its ID.
 * @param {string} title
 * @param {string} subtitle
 * @typedef {("ITEM" | "FOLDER")} NodeType
 * @param {NodeType} type
 * @return {*}
 */
export function createNode({ title = DEFAULT_TITLES.NOTE, subtitle = new Date().toLocaleString(), type = nodeTypes.ITEM }
  : { title?: string, subtitle?: string, type?: NodeTypeT })
  : TreeNodeT {
  // TODO: remove subtitle = uuid
  const id: string = uuid();
  const newNode: TreeNodeT = {
    title,
    subtitle: id,
    type,
    uniqid: id,
    get id() {
      return `${this.type}${ID_DELIMITER}${this.uniqid}`;
    },
    selected: false,
  };

  if (type === nodeTypes.FOLDER) {
    newNode.children = [];
    newNode.expanded = true;
    newNode.title = title === DEFAULT_TITLES.NOTE ? DEFAULT_TITLES.FOLDER : title;
  }

  return newNode;
}

/**
 * Returns the index of the node of type FOLDER that is deepest in the given path.
 * Returns null if path is invalid. Returns -1 if FOLDER is root.
 * @param path {Array}
 * @return {number|null} Index of deepest FOLDER in path; -1 if that FOLDER is root; null if path is invalid.
 */
export function findDeepestFolder(path: string[])
  : number|null {
  if (!Array.isArray(path) || !path.length) {
    return null;
  }

  const nodeInfo = translateNodeIdToInfo({ nodeId: path[path.length - 1]});
  // if last entry in path is a FOLDER, then that is the farthest one
  if (nodeInfo && nodeInfo.type === nodeTypes.FOLDER) {
    return path.length - 1;
  }

  // If path consists of only one node and it's an ITEM, then "farthest" folder is root
  if (path.length === 1) {
    return -1;
  }

  const parent = path[path.length - 2];
  if (typeof parent !== 'string') {
    return null;
  } else {
    const re = new RegExp(`^${nodeTypes.FOLDER}`);
    return (re.test(parent) ? path.length - 2 : null);
  }
}

/**
 * Returns the info (object with type and uniqid) embedded in provided node ID. Returns null if invalid node ID provided.
 * Example: For ID "folder|^|a9914200-a7d2-11e8-a12b-99205b853de7"
 *          type is "folder"
 *          uniqid is "a9914200-a7d2-11e8-a12b-99205b853de7""
 *
 * Note: possible types defined in appCONSTANTS module.
 * @param {Object} params
 * @param {string} params.nodeId
 * @return {object|null}
 */
export function translateNodeIdToInfo({ nodeId }: { nodeId: string })
  : { type: NodeTypeT, uniqid: string } | null {
  if (typeof nodeId !== 'string') {
    return null;
  }

  const info = nodeId.split(ID_DELIMITER);
  if (info.length < 2) {
    return null;
  }

  const reSource = `^(?:${nodeTypes.ITEM}|${nodeTypes.FOLDER})$`;
  const re = new RegExp(reSource);
  if (re.test(info[0])) {
    return {
      type: info[0] as NodeTypeT,
      uniqid: info[1],
    };
  } else {
    return null;
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
export function translatePathToInfo({ notesTree = [], path = [], kind = 'type' }
  : { notesTree?: TreeNodeT[], path: string[], kind: 'title'|'type'|'uniqid' })
  : string[] {
  if (!Array.isArray(path) || !path.length) {
    return [];
  }

  switch (kind) {
    case 'title':
      return path.map((id: string): string => {
        const matches: NodeData[] = find({
          getNodeKey,
          treeData: notesTree,
          searchQuery: id,
          searchMethod: ({ node: treeNode, searchQuery }): boolean => searchQuery === treeNode.id,
        }).matches;
        return matches.length && matches[0].node.title ? (matches[0].node.title as string) : '';
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
 * @param tree {Object[]}
 * @returns {*}
 */
// TODO To remove
// https://stackoverflow.com/questions/41312228/filter-nested-tree-object-without-losing-structure
export function trimTree(tree: TreeNodeT[])
  : object[] {
  if (!Array.isArray(tree)) {
    return [];
  }

  return tree.map((node: TreeNodeT) => {
    const normNode: { uniqid: string, children?: object[] } = {
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
 * Collapse all first-level folders in the tree.
 * @param tree {Object[]}
 */
export function collapseFolders({ tree }: { tree: TreeNodeT[] })
  : TreeNodeT[] {
  return tree.map((node): TreeNodeT => {
    if (node && node.children) {
      return { ...node, expanded: false };
    } else {
      return node;
    }
  });
}

/**
 * Returns an array of all the node's descendants.
 * @param node {Object}
 * @return {Object[]}
 */
export function getDescendants({ node }: { node: TreeNodeT })
  : TreeNodeT[] {
  if (!node || typeof node !== 'object') {
    return [];
  }

  return getFlatDataFromTree({ treeData: [node], getNodeKey, ignoreCollapsed: false }).map((data) => data.node) as TreeNodeT[];
}

/**
 *
 * @param {Object} params
 * @param {Object} params.node
 * @return {Array}
 */
export function getDescendantItems({ node }: { node: TreeNodeT })
  : TreeNodeT[] {
  return getDescendants({ node }).filter(descendant => descendant.type === nodeTypes.ITEM);
}

export function getDescendantFolders({ node }: { node: TreeNodeT })
  : TreeNodeT[] {
  return getDescendants({ node }).filter(descendant => descendant.type === nodeTypes.FOLDER);
}
