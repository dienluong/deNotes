import { create } from './remoteStorageJs';
import notesDataModule from './notesDataModule';
import treesDataModule from './treesDataModule';

let _offlineStorage;
let _save = () => Promise.reject('Not ready');
let _load = () => Promise.reject('Not ready');
let _remove = () => Promise.reject('Not ready');
const privateStorageMap = new Map();

try {
  _offlineStorage = create({ name: 'denotes' });
  _offlineStorage.addModule(notesDataModule);
  _offlineStorage.addModule(treesDataModule);
  privateStorageMap.set(notesDataModule.name, _offlineStorage[notesDataModule.name].privateContent());
  privateStorageMap.set(treesDataModule.name, _offlineStorage[treesDataModule.name].privateContent());
  _offlineStorage.on('ready', function produceMethods() {
    _save = ({ collectionName, id, ownerId, dataObj }) => {
      if (!privateStorageMap.has(collectionName)) {
        return Promise.reject(new Error('Invalid collection'));
      }

      return privateStorageMap.get(collectionName).save({ id, ownerId, dataObj });
    };

    _load = ({ collectionName, id, ownerId }) => {
      if (!privateStorageMap.has(collectionName)) {
        return Promise.reject(new Error('Invalid collection'));
      }

      return privateStorageMap.get(collectionName).load({ id, ownerId });
    };

    _remove = ({ collectionName, ownerId, ids }) => {
      if (!privateStorageMap.has(collectionName)) {
        return Promise.reject(new Error('Invalid collection'));
      }

      return privateStorageMap.get(collectionName).destroy({ ownerId, ids });
    };
  });
} catch (err) {
  // TODO: where to fallback if local storage is unavailable?
}

export function save(paramsObj) {
  return _save(paramsObj);
}

export function load(paramsObj) {
  return _load(paramsObj);
}

export function remove(paramsObj) {
  return _remove(paramsObj);
}

