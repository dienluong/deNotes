import { create } from './remoteStorageJs';
import notesDataModule from './notesDataModule';
import treesDataModule from './treesDataModule';

let _offlineStorage;
let _save = () => Promise.reject(new Error('Not ready'));
let _load = () => Promise.reject(new Error('Not ready'));
let _remove = () => Promise.reject(new Error('Not ready'));
const privateStorageMap = new Map();

function produceMethods() {
  // TODO: remove
  console.log('LOCAL STORAGE READY!');
  _save = ({ collectionName, id, ownerId, dataObj }) => {
    if (!privateStorageMap.has(collectionName)) {
      return Promise.reject(new Error('Invalid collection.'));
    }

    if (!id || !ownerId || !dataObj) {
      return Promise.reject(new Error('Invalid parameters.'));
    }

    return privateStorageMap.get(collectionName).save({ id, ownerId, dataObj });
  };

  _load = ({ collectionName, id, ownerId }) => {
    if (!privateStorageMap.has(collectionName)) {
      return Promise.reject(new Error('Invalid collection'));
    }

    if (!ownerId) {
      return Promise.reject(new Error('Invalid parameters.'));
    }

    return privateStorageMap.get(collectionName).load({ id, ownerId });
  };

  _remove = ({ collectionName, ownerId, ids }) => {
    if (!privateStorageMap.has(collectionName)) {
      return Promise.reject(new Error('Invalid collection'));
    }

    if (!ownerId) {
      return Promise.reject(new Error('Invalid parameters.'));
    }

    return privateStorageMap.get(collectionName).destroy({ ownerId, ids });
  };
}

try {
  _offlineStorage = create({});
  _offlineStorage.addModule(notesDataModule);
  _offlineStorage.addModule(treesDataModule);
  _offlineStorage.access.claim(notesDataModule.name, 'rw');
  _offlineStorage.access.claim(treesDataModule.name, 'rw');
  _offlineStorage.caching.enable(`/${notesDataModule.name}/`);
  _offlineStorage.caching.enable(`/${treesDataModule.name}/`);

  privateStorageMap.set(notesDataModule.name, _offlineStorage[notesDataModule.name].privateContent());
  privateStorageMap.set(treesDataModule.name, _offlineStorage[treesDataModule.name].privateContent());
} catch (err) {
  window.alert('Local storage not available.');
  // TODO: where to fallback if local storage is unavailable?
}

// TODO: To revise.  No on(ready) ?
produceMethods();

export function save(paramsObj) {
  return _save(paramsObj)
    .catch(err => {
      return Promise.reject(err.error);
    });
}

export function load(paramsObj) {
  return _load(paramsObj);
}

export function remove(paramsObj) {
  return _remove(paramsObj)
    .then(results => {
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

