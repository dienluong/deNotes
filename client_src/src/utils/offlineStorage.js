import { create } from './remoteStorageJs';
import notesDataModule from './notesDataModule';
import treesDataModule from './treesDataModule';

let _offlineStorage, _myExports;
const storageMap = new Map();
try {
  _offlineStorage = create({ name: 'denotes' });
  _offlineStorage.addModule(notesDataModule);
  _offlineStorage.addModule(treesDataModule);
  storageMap.set(notesDataModule.name, _offlineStorage[notesDataModule.name].privateContent());
  storageMap.set(treesDataModule.name, _offlineStorage[treesDataModule.name].privateContent());
}
catch (err) {
  // TODO: where to fallback if local storage is unavailable?
}

(async function waitForReady() {
  _myExports = await new Promise(resolve => {
    _offlineStorage.on('ready', function produceMethods() {
      resolve({
        _save({ collectionName, id, ownerId, dataObj }) {
          if (!storageMap.has(collectionName)) {
            return Promise.reject(new Error('Invalid collection'));
          }

          return storageMap.get(collectionName).save({ id, ownerId, dataObj });
        },
        _load({ collectionName, id, ownerId }) {
          if (!storageMap.has(collectionName)) {
            return Promise.reject(new Error('Invalid collection'));
          }

          return storageMap.get(collectionName).load({ id, ownerId });
        },
        _remove({ collectionName, ownerId, ids }) {
          if (!storageMap.has(collectionName)) {
            return Promise.reject(new Error('Invalid collection'));
          }

          return storageMap.get(collectionName).destroy({ ownerId, ids });
        },
      });
    });
  });
})();

export const { _save: save, _load: load, _remove: remove } = _myExports;
