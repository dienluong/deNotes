import { find, getNodeAtPath } from 'react-sortable-tree';
import { createSelector } from 'reselect';
import { getNodeKey, findDeepestFolder } from '../../utils/treeUtils';
import { selectNotesTreeTree, selectActiveNodePath } from '../reducers';

// TODO: remove
// const selectNotesTree = (state) => state.notesTree;
// const selectActiveNodePath = (state) => state.activeNode.path;

/**
 * For each note ID in path, return the corresponding title.
 * @param {Object[]} notesTree
 * @param {string[]} idList
 * @return {string[]}
 */
export const selectTitlesFromActivePath = createSelector(
  [selectNotesTreeTree, selectActiveNodePath],
  (tree = [], idList = []) => {
    if (!Array.isArray(idList) || !idList.length || !Array.isArray(tree)) {
      return [];
    }

    return idList.map((id) => {
      const matches = find({
        getNodeKey,
        treeData: tree,
        searchQuery: id,
        searchMethod: ({ node, searchQuery }) => searchQuery === node.id,
      }).matches;
      return matches.length ? matches[0].node.title : '';
    });
  }
);

/**
 *  Returns nodes of the active folder node specified by the provided path.
 *  @param {Object[]} notesTree
 *  @param {string[]} activePath
 *  @return {Object[]}
 */
export const selectChildrenOfActiveFolder = createSelector(
  [selectNotesTreeTree, selectActiveNodePath],
  (tree = [], activePath = []) => {
    if (!Array.isArray(activePath) || !activePath.length || !Array.isArray(tree)) {
      return [];
    }

    const parentIdx = findDeepestFolder(activePath);
    if (parentIdx === null) {
      return [];
    }

    if (parentIdx === -1) {
      // folder is root, then the list of children is the tree itself
      return tree;
    }

    const parentPath = activePath.slice(0, parentIdx + 1);
    const parentInfo = getNodeAtPath({
      treeData: tree,
      path: parentPath,
      getNodeKey,
      ignoreCollapsed: false,
    });

    if ((parentInfo === null) || !parentInfo.node || !Array.isArray(parentInfo.node.children)) {
      return [];
    }

    return parentInfo.node.children;
  }
);
