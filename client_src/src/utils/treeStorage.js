let _save = () => Promise.reject(new Error('Save aborted. Cause: No Storage implementation provided.'));
let _load = () => Promise.reject(new Error('Load aborted. Cause: No Storage implementation provided.'));

export function inject({ save = _save, load = _load }) {
  _save = save;
  _load = load;
}

export function saveTree(tree, userId) {
  return _save(userId, {
    'jsonStr': JSON.stringify(tree),
    'ownerId': userId,
  }).then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`ERROR saving tree! ${response.status} - ${response.statusText}`);
    }
  });
}

/**
 * Returns a promise for an array of trees
 * @param userId
 * @return {Promise<Response | never>}
 */
export function loadTree(userId) {
  return _load(userId)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`ERROR loading tree! ${response.status} - ${response.statusText}`);
      }
    });
}
