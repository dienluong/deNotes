let _save: Function = () => Promise.reject(new Error('Save aborted. Cause: No Storage implementation provided.'));
let _load: Function = () => Promise.reject(new Error('Load aborted. Cause: No Storage implementation provided.'));
let _remove: Function = () => Promise.reject(new Error('Remove aborted. Cause: No Storage implementation provided.'));

export function inject({ save = _save, load = _load, remove = _remove }: { save?: Function, load?: Function, remove?: Function })
  : void {
  _save = typeof save === 'function' ? save : _save;
  _load = typeof load === 'function' ? load : _load;
  _remove = typeof remove === 'function' ? remove : _remove;
}

export function save({ userId, notesTree }: { userId: string, notesTree: NotesTreeT })
  : Promise<any> {
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
 * @param {string} [id=''] ID of the tree to load (optional)
 * @param {string} userId
 * @returns {*}
 */
export function load({ id = '', userId = '' }: { id: string, userId: string })
  : Promise<NotesTreeT> {
  if (!userId || typeof id !== 'string' || typeof userId !== 'string') {
    return Promise.reject(new Error('invalid parameters.'));
  }

  return _load({
    collectionName: 'trees',
    id,
    ownerId: userId,
  }).then((fetchedData: any) => {
    const propList = ['id', 'tree', 'dateCreated', 'dateModified'];
    let notesTree: any;
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

export function remove(...args: any[]) {
  return _remove(args);
}
