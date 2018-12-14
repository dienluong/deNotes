interface ObserverT {
  (notesTree: NotesTreeT): Promise<any>;
  lastSavedDate: number;
}

export default ({ user, storage }: { user: string, storage: StorageT })
  : ObserverT => {
  let _user = '';
  let _storage: StorageT = {
    save() { return Promise.reject(new Error('Cannot Save: Storage not available')); },
    load() { return Promise.reject(new Error('Cannot Load: Storage not available')); },
    remove() { return Promise.reject(new Error('Cannot Remove: Storage not available')); },
  };

  // TODO: Remove
  // _user = typeof user === 'string' ? user : _user;

  _user = user;
  // @ts-ignore
  _storage = storage && typeof storage === 'object' && Object.keys(_storage).every(key => ((key in storage) && (typeof storage[key] === 'function')))
    ? storage : _storage;

  const observer: ObserverT = function observer(notesTree: NotesTreeT) {
    const mostRecentDate: number = notesTree.dateModified > notesTree.dateCreated ? notesTree.dateModified : notesTree.dateCreated;
    // Save only if tree was not from initial load and if it changed afterwards
    if (mostRecentDate > observer.lastSavedDate) {
      return _storage.save({ userId: _user, notesTree })
        .then(responseObj => {
          observer.lastSavedDate = mostRecentDate;
          console.log(`$$$$$$$$$$$$$$$ Tree saved!!!\n${JSON.stringify(responseObj, null, 2)}`);
          return responseObj;
        })
        .catch((err) => {
          window.alert('Failed to save notes list. ' + err.message);
          return Promise.reject(err);
        });// TODO: Failed save should retry.
    } else {
      console.log('############### Tree did not change. Skip saving.');
      return Promise.resolve(false);
    }
    // TODO: remove
    // console.log('************* Tree *************\n');
    // console.log(JSON.stringify(tree, null, 4));
  };

  observer.lastSavedDate = Date.now();
  return observer;
};
