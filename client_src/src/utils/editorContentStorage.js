let _save = () => Promise.reject(new Error('Save aborted. Cause: No Storage implementation provided.'));
let _load = () => Promise.reject(new Error('Load aborted. Cause: No Storage implementation provided.'));

export function inject({ save = _save, load = _load }) {
  _save = typeof save === 'function' ? save : _save;
  _load = typeof load === 'function' ? load : _load;
}

export function save({ userId, editorContent }) {
  if (!editorContent || !editorContent.content || !editorContent.delta) {
    return Promise.reject(new Error('Save aborted. Cause: invalid content.'));
  }

  if (!userId) {
    return Promise.reject(new Error('Save aborted. Cause: invalid userId.'));
  }

  return _save({
    collectionName: 'notes',
    ownerId: userId,
    // TODO: Replace hardcoded values
    dataObj: {
      'id': '45745c60-7b1a-11e8-9c9c-2d42b21b1a3e',
      'title': 'Hardcoded Title',
      'body': editorContent.content,
      'delta': JSON.stringify(editorContent.delta),
      'dateCreated': '2018-08-27T11:11:11.435Z',
      'dateModified': '2018-08-27T22:22:22.435Z',
      'ownerId': userId,
    },
  }).then(response => {
    if (response.ok) {
      return response.json();
    } else {
      return Promise.reject(new Error(`ERROR saving content! ${response.status} - ${response.statusText}`));
    }
  });
}

/**
 * Returns a promise for an array of content
 * @param noteId
 * @return {Promise<Response | never>}
 */
export function load({ id = null, userId = null }) {
  if (!id && !userId) {
    return Promise.reject(new Error('Load aborted. Cause: invalid parameters.'));
  }

  return _load({
    collectionName: 'notes',
    id,
    ownerId: userId,
  }).then(response => {
    if (response.ok) {
      return response.json();
    } else {
      return Promise.reject(new Error(`ERROR loading content! ${response.status} - ${response.statusText}`));
    }
  });
}
