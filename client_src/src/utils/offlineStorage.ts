import { create } from './remoteStorageJs';
import notesDataModule from './remoteStorageJs/notesDataModule';
import treesDataModule from './remoteStorageJs/treesDataModule';

const _privateStorageCollection = new Map();
let storage = null;
let _save: Function = () => Promise.reject(new Error('Not ready'));
let _load: Function = () => Promise.reject(new Error('Not ready'));
let _remove: Function = () => Promise.reject(new Error('Not ready'));

function _produceMethods() {
  // TODO: remove
  console.log('LOCAL STORAGE READY!');
  _save = ({ collectionName, id, ownerId, dataObj }: { collectionName: string, id: string, ownerId: string, dataObj: object })
    : Promise<any> => {
    if (!_privateStorageCollection.has(collectionName)) {
      return Promise.reject(new Error('Invalid collection.'));
    }

    if (!id || !ownerId || !dataObj) {
      return Promise.reject(new Error('Invalid parameters.'));
    }

    return _privateStorageCollection.get(collectionName).save({ id, ownerId, dataObj });
  };

  _load = ({ collectionName, id, ownerId }: { collectionName: string, id: string, ownerId: string })
    : Promise<any> => {
    if (!_privateStorageCollection.has(collectionName)) {
      return Promise.reject(new Error('Invalid collection'));
    }

    if (!ownerId) {
      return Promise.reject(new Error('Invalid parameters.'));
    }

    return _privateStorageCollection.get(collectionName).load({ id, ownerId });
  };

  _remove = ({ collectionName, ownerId, ids }: { collectionName: string, ownerId: string, ids: string|string[] })
    : Promise<any> => {
    if (!_privateStorageCollection.has(collectionName)) {
      return Promise.reject(new Error('Invalid collection'));
    }

    if (!ownerId) {
      return Promise.reject(new Error('Invalid parameters.'));
    }

    return _privateStorageCollection.get(collectionName).destroy({ ownerId, ids });
  };
}

try {
  storage = create({} as any);
  storage.addModule(notesDataModule);
  storage.addModule(treesDataModule);
  storage.access.claim(notesDataModule.name, 'rw');
  storage.access.claim(treesDataModule.name, 'rw');
  storage.caching.enable(`/${notesDataModule.name}/`);
  storage.caching.enable(`/${treesDataModule.name}/`);

  _privateStorageCollection.set(notesDataModule.name, storage[notesDataModule.name].privateContent());
  _privateStorageCollection.set(treesDataModule.name, storage[treesDataModule.name].privateContent());
} catch (err) {
  window.alert('Local storage not available. ' + err);
  console.error(err);
  // TODO: where to fallback if local storage is unavailable?
}

// TODO: To revise.  No on(ready) ?
_produceMethods();

export function save(paramsObj: object) {
  return _save(paramsObj);
}

export function load(paramsObj: object) {
  return _load(paramsObj);
}

export function remove(paramsObj: object) {
  return _remove(paramsObj)
    .then((results: string|string[]) => {
      if (typeof results === 'string') {
        return {
          results,
          count: 1,
        };
      }

      if (Array.isArray(results)) {
        return {
          results,
          count: results.filter(res => typeof res === 'string').length,
        };
      } else {
        return Promise.reject(new Error('Unknown result on delete.'));
      }
    });
}

export default { save, load, remove, storage };
