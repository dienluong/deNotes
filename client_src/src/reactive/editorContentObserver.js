let _user = '';
let _storage = {
  save() { return Promise.reject(new Error('Cannot Save: Storage not available')); },
  load() { return Promise.reject(new Error('Cannot Load: Storage not available')); },
  remove() { return Promise.reject(new Error('Cannot Remove: Storage not available')); },
};
let _lastSavedDate = Date.now();
let _lastContentId = null;

export function inject({ user, storage }) {
  _user = typeof user === 'string' ? user : _user;
  _storage = typeof storage === 'object' && Object.keys(_storage).every(key => ((key in storage) && (typeof storage[key] === 'function'))) ? storage : _storage;
}

/**
 *
 * @param editorContent {Object}
 * @return {Promise} Promise resolving to the saved object or to FALSE if save was skipped; or a Promise rejecting to an Error.
 */
export function save(editorContent) {
  let retValue;
  // TODO:  Should it save if and only if condition #2 (id = lastContentId && dateModified > lastSavedDate) is met. This would *not* save newly created empty notes.
  // Save 1) if newly created note -OR- 2) if content of opened note changed since last save.
  if (editorContent.dateCreated > _lastSavedDate || (editorContent.id === _lastContentId && editorContent.dateModified > _lastSavedDate)) {
    retValue = _storage.save({ userId: _user, editorContent })
      .then(responseObj => {
        // TODO: remove
        // console.log(editorContent.dateCreated, editorContent.dateModified, _lastSavedDate, _lastContentId, editorContent.id);
        _lastSavedDate = editorContent.dateModified > editorContent.dateCreated ? editorContent.dateModified : editorContent.dateCreated;
        console.log(`$$$$$$$$$$$$$$$ Content saved!!!\n${JSON.stringify(responseObj, null, 2)}`);
        return responseObj;
      })
      .catch(err => {
        window.alert('Failed to save editor content. ' + err.message);
        return Promise.reject(err);
      });// TODO: Failed save should retry
  } else {
    console.log('############### Content did not change. Skip saving.');
    retValue = Promise.resolve(false);
  }

  _lastContentId = editorContent.id;
  return retValue;
}

