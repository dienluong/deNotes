let _save = () => Promise.reject(new Error('Save aborted. Cause: No Storage implementation provided.'));
let _load = () => Promise.reject(new Error('Load aborted. Cause: No Storage implementation provided.'));

export function inject({ save = _save, load = _load }) {
  _save = typeof save === 'function' ? save : _save;
  _load = typeof load === 'function' ? load : _load;
}

export function save({ userId, notesTree }) {
  if (!Array.isArray(notesTree.tree)) {
    return Promise.reject(new Error('Save aborted. Cause: invalid tree.'));
  }

  if (!userId) {
    return Promise.reject(new Error('Save aborted. Cause: invalid userId.'));
  }

  return _save({
    collectionName: 'trees',
    ownerId: userId,
    dataObj: {
      'jsonStr': JSON.stringify(notesTree.tree),
      'ownerId': userId,
      'dateCreated': notesTree.dateCreated,
      'dateModified': notesTree.dateModified,
    },
  }).then(response => {
    if (response.ok) {
      return response.json();
    } else {
      return Promise.reject(new Error(`ERROR saving tree! ${response.status} - ${response.statusText}`));
    }
  });
}

/**
 * Returns a promise for an array of trees
 * @param id
 * @param userId
 * @return {Promise<Response | never>}
 */
export function load({ id = '', userId = '' }) {
  if (!id && !userId) {
    return Promise.reject(new Error('Load aborted. Cause: invalid parameters.'));
  }

  return _load({
    collectionName: 'trees',
    id,
    ownerId: userId,
  }).then(response => {
    if (response.ok) {
      return response.json();
    } else {
      return Promise.reject(new Error(`ERROR loading tree! ${response.status} - ${response.statusText}`));
    }
  }).then(noteTrees => {
    let noteTree;
    if (Array.isArray(noteTrees)) {
      if (noteTrees.length) {
        noteTree = noteTrees[noteTrees.length - 1];
      } else {
        // if no tree (noteTrees is empty array)...
        return {};
      }
    } else {
      noteTree = noteTrees;
    }
    const tree = JSON.parse(noteTree.jsonStr);
    const dateCreated = new Date(noteTree.dateCreated).getTime();
    const dateModified = new Date(noteTree.dateModified).getTime();
    return { tree, dateCreated, dateModified };
  });
}
