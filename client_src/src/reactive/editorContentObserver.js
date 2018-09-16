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

export function save(editorContent) {
  // TODO: remove
  // console.log(_lastSavedDate, editorContent.dateCreated, editorContent.dateModified, _lastContentId, editorContent.id);
  // Save only if 1) content was not from initial load, 2) if content changed, 3) content is for the same note (i.e. not content of newly loaded note)

  // Save 1) if newly created note -OR- 2) if content of already opened note changed.
  if (editorContent.dateCreated > _lastSavedDate || (editorContent.id === _lastContentId && editorContent.dateModified > _lastSavedDate)) {
    _storage.save({ userId: _user, editorContent })
      .then(responseObj => {
        // TODO: remove
        // console.log(editorContent.dateCreated, editorContent.dateModified, _lastSavedDate, _lastContentId, editorContent.id);
        _lastSavedDate = editorContent.dateModified > editorContent.dateCreated ? editorContent.dateModified : editorContent.dateCreated;
        console.log(`$$$$$$$$$$$$$$$ Content saved!!!\n${JSON.stringify(responseObj, null, 2)}`);
      })
      .catch((err) => window.alert('Failed to save editor content. ' + err.message));// TODO: Failed save should retry
  } else {
    console.log('############### Content did not change. Skip saving.');
  }

  _lastContentId = editorContent.id;

  // TODO: remove
  // console.log('************* CONTENT *************\n');
  // console.log(JSON.stringify(editorContent, null, 4));

  // if (observer.prevContent !== editorContent && editorContent.id === _lastContentId) {
  //   storage.save({ userId: user, editorContent })
  //     .then(responseObj => {
  //       observer.prevContent = editorContent;
  //       console.log(`$$$$$$$$$$$$$$$ Content saved!!!\n${JSON.stringify(responseObj, null, 2)}`);
  //     })
  //     .catch(() => window.alert('Failed to save editor content'));// TODO: Failed save should retry
  // } else {
  //   observer.prevContent = editorContent;
  //   _lastContentId = editorContent.id;
  //   console.log('############### Content did not change. Skip saving.');
  // }
  // console.log('************* CONTENT *************\n');
  // console.log(JSON.stringify(editorContent, null, 4));
}
// observer.prevContent = null;


