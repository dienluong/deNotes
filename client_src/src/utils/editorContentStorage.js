let _save = () => Promise.reject(new Error('Save aborted. Cause: No Storage implementation provided.'));
let _load = () => Promise.reject(new Error('Load aborted. Cause: No Storage implementation provided.'));

export function inject({ save = _save, load = _load }) {
  _save = typeof save === 'function' ? save : _save;
  _load = typeof load === 'function' ? load : _load;
}

export function save({ userId, editorContent }) {
  if (!editorContent || !editorContent.content || !editorContent.delta || !editorContent.id) {
    return Promise.reject(new Error('Save aborted. Cause: invalid content.'));
  }

  if (!userId) {
    return Promise.reject(new Error('Save aborted. Cause: invalid userId.'));
  }

  return _save({
    collectionName: 'notes',
    id: editorContent.id,
    ownerId: userId,
    // TODO: Replace hardcoded values
    dataObj: {
      'id': editorContent.id,
      'title': 'Hardcoded Title',
      'body': editorContent.content,
      'delta': JSON.stringify(editorContent.delta),
      'dateCreated': editorContent.dateCreated,
      'dateModified': editorContent.dateModified,
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
export function load({ id = '', userId = '' }) {
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
