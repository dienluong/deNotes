let _user = '';
let _storage: StorageT = {
  save() { return Promise.reject(new Error('Cannot Save: Storage not available')); },
  load() { return Promise.reject(new Error('Cannot Load: Storage not available')); },
  remove() { return Promise.reject(new Error('Cannot Remove: Storage not available')); },
};
let _lastSavedDate = Date.now();
let _lastContentId: string|null = null;

export function inject({ user, storage }: { user: string, storage: StorageT})
  : void {
  _user = user;
  // @ts-ignore
  _storage = storage && typeof storage === 'object' && Object.keys(_storage).every(key => ((key in storage) && (typeof storage[key] === 'function')))
    ? storage : _storage;
}

/**
 *
 * @param editorContent {Object}
 * @return {Promise} Promise resolving to the saved object or to FALSE if save was skipped; or a Promise rejecting to an Error.
 */
export function save(editorContent: EditorContentT)
  : Promise<any> {
  let retValue: Promise<any>;
  // TODO:  Should it save if and only if condition #2 (id = lastContentId && dateModified > lastSavedDate) is met. This would *not* save newly created empty notes.
  // Save 1) if newly created note -OR- 2) if content of opened note changed since last save.
  if (editorContent.dateCreated > _lastSavedDate || (editorContent.id === _lastContentId && editorContent.dateModified > _lastSavedDate && editorContent.title)) {
    retValue = _storage.save({ userId: _user, editorContent })
      .then(responseObj => {
        _lastSavedDate = editorContent.dateModified > editorContent.dateCreated ? editorContent.dateModified : editorContent.dateCreated;
        // TODO Remove
        console.log(`$$$$$$$$$$$$$$$ Content saved!!!\n${JSON.stringify(responseObj, null, 2)}`);
        return responseObj;
      })
      .catch(err => {
        window.alert('Failed to save editor content. ' + err.message);
        return Promise.reject(err);
      });// TODO: Failed save should retry
  } else {
    // TODO Remove
    console.log('############### Content did not change. Skip saving.');
    retValue = Promise.resolve(false);
  }

  _lastContentId = editorContent.id;
  return retValue;
}

