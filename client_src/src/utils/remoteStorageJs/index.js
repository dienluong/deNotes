import RemoteStorage from 'remotestoragejs';
const logging = !!process.env.REACT_APP_DEBUG;

export function create({ onReadyCb }) {
  const storage = new RemoteStorage({ logging });
  if (typeof onReadyCb === 'function') {
    storage.on('ready', onReadyCb);
  }
  return storage;
}

/*
function TO_DELETE({ name, userId, dataModule }) {
  if (typeof name !== 'string') {
    return new Promise.reject(new Error('Invalid name'));
  }
  if (typeof dataModule !== 'object' || typeof dataModule.builder !== 'function' || typeof dataModule.name !== 'string') {
    return new Promise.reject(new Error('Invalid data module'));
  }
  const _storage = new RemoteStorage({ logging, modules: [dataModule] });
  _storage.access.claim(name, 'rw');
  _storage.caching.enable(`/${name}/`);
  const privateNotes = _storage[dataModule.name].privateNotes(userId);
  return new Promise(resolve => {
    _storage.on('ready', () => resolve({
      save({ collectionName = '', id = '', ownerId = '', dataObj }) {
        privateNotes.save({ collectionName, id, dataObj });
      },

      load({ collectionName = '', id = '' }) {
        privateNotes.load({ collectionName, id });
      },

      remove({ collectionName = '', ids = '' }) {
        privateNotes.destroy({ collectionName, ids });
      },
    }));
  });
}
*/
