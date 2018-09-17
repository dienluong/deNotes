import { find } from 'react-sortable-tree';
import { createSelector } from 'reselect';
import { getNodeKey } from '../../utils/treeUtils';
import { selectNotesTreeTree, selectActiveNodePath } from '../reducers';

// TODO: remove
// const selectNotesTree = (state) => state.notesTree;
// const selectActiveNodePath = (state) => state.activeNode.path;

/**
 * For each note ID in path, return the corresponding title.
 * @param notesTree {!Object[]}
 * @param idList {Array}
 * @return {Array}
 * @private
 */
export const selectTitlesFromActivePath = createSelector(
  [selectNotesTreeTree, selectActiveNodePath],
  (notesTree = [], idList = []) => {
    if (!Array.isArray(idList) || !idList.length) {
      return [];
    }

    return idList.map((id) => {
      const matches = find({
        getNodeKey,
        treeData: notesTree,
        searchQuery: id,
        searchMethod: ({ node, searchQuery }) => searchQuery === node.id,
      }).matches;
      return matches.length ? matches[0].node.title : '';
    });
  }
);
