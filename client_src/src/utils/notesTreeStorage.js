let _save = () => Promise.reject(new Error('Save aborted. Cause: No Storage implementation provided.'));
let _load = () => Promise.reject(new Error('Load aborted. Cause: No Storage implementation provided.'));

export function inject({ save = _save, load = _load }) {
  _save = save;
  _load = load;
}

export function saveTree({ userId, tree }) {
  if (!Array.isArray(tree)) {
    return Promise.reject(new Error('Save aborted. Cause: invalid tree.'));
  }

  if (!userId) {
    return Promise.reject(new Error('Save aborted. Cause: invalid userId.'));
  }

  return _save({
    collectionName: 'trees',
    ownerId: userId,
    dataObj: {
      'jsonStr': JSON.stringify(tree),
      'ownerId': userId,
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
export function loadTree({ id = null, userId = null }) {
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
  });
}
