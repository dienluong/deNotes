let _save = () => Promise.reject(new Error('Save aborted. Cause: No Storage implementation provided.'));
let _load = () => Promise.reject(new Error('Load aborted. Cause: No Storage implementation provided.'));

export function inject({ save = _save, load = _load }) {
  _save = typeof save === 'function' ? save : _save;
  _load = typeof load === 'function' ? load : _load;
}

export function save({ userId, notesTree }) {
  if (!notesTree || !Array.isArray(notesTree.tree) || !notesTree.id) {
    return Promise.reject(new Error('invalid tree.'));
  }

  if (!userId || typeof userId !== 'string') {
    return Promise.reject(new Error('invalid user ID.'));
  }

  return _save({
    collectionName: 'trees',
    id: notesTree.id,
    ownerId: userId,
    dataObj: {
      'id': notesTree.id,
      'tree': notesTree.tree,
      'dateCreated': notesTree.dateCreated || 0,
      'dateModified': notesTree.dateModified || 0,
      'ownerId': userId,
    },
  });
}

/**
 * Returns a promise resolving to an object containing the tree, the modified and the created dates.
 * @param id
 * @param userId
 * @returns {*}
 */
export function load({ id = '', userId = '' }) {
  if (!id || !userId || typeof id !== 'string' || typeof userId !== 'string') {
    return Promise.reject(new Error('invalid parameters.'));
  }

  return _load({
    collectionName: 'trees',
    id,
    ownerId: userId,
  }).then(fetchedData => {
    const propList = ['id', 'tree', 'dateCreated', 'dateModified'];
    let notesTree;
    if (Array.isArray(fetchedData)) {
      if (fetchedData.length) {
        // just take the last tree, if multiple returned.
        notesTree = fetchedData[fetchedData.length - 1];
      } else {
        // if no tree...
        notesTree = {};
      }
    } else {
      if (fetchedData) {
        notesTree = fetchedData;
      } else {
        notesTree = {};
      }
    }

    if (notesTree && (typeof notesTree.hasOwnProperty === 'function') && propList.every(prop => notesTree.hasOwnProperty(prop))) {
      const tree = typeof notesTree.tree === 'string' ? JSON.parse(notesTree.tree) : notesTree.tree;
      const dateCreated = new Date(notesTree.dateCreated).getTime();
      const dateModified = new Date(notesTree.dateModified).getTime();
      return { ...notesTree, tree, dateCreated, dateModified };
    } else {
      const message = `Unrecognized data fetched. ID: ${id}`;
      return Promise.reject(new Error(message));
    }
  });
}
