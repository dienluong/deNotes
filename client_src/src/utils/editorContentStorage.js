let _save = () => Promise.reject(new Error('Save aborted. Cause: No Storage implementation provided.'));
let _load = () => Promise.reject(new Error('Load aborted. Cause: No Storage implementation provided.'));

export function inject({ save = _save, load = _load }) {
  _save = save;
  _load = load;
}

export function saveEditorContent(editorContent, userId) {
  return _save({
    collectionName: 'notes',
    id: userId,
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
      throw new Error(`ERROR saving content! ${response.status} - ${response.statusText}`);
    }
  });
}

/**
 * Returns a promise for an array of content
 * @param noteId
 * @return {Promise<Response | never>}
 */
export function loadEditorContent({ id = null, userId = null }) {
  return _load({
    collectionName: 'notes',
    id,
    ownerId: userId,
  }).then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`ERROR loading content! ${response.status} - ${response.statusText}`);
    }
  });
}
