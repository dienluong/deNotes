// Types
import { BaseClient } from '.';
export interface AugmentedError extends Error {
  caught?: any;
  id?: string;
}

const clientMixin = function clientMixin(moduleName: string) {
  return ({
    save({ ownerId, id, dataObj }) {
      const path = `${ownerId}/${id}`;
      return this.storeObject(moduleName, path, dataObj)
        .catch(err => {
          // remoteStorageJS storeObject()'s Promise rejects to a ValicationError
          // ValidationError is poorly documented.  It is an object that includes an "error" property, which is an Error object.
          return Promise.reject(err.error);
        });
    },

    load({ ownerId, id }) {
      if (!id) {
        // remoteStorageJS getAll() is poorly documented.
        // It returns an object (that is not an array) containing all the objects stored.
        // The key is the object's path relative to the path provided to getAll().
        // We are converting the object of objects into an array of objects.
        return this.getAll(`${ownerId}/`)
          .then(data => {
            if (data && typeof data === 'object') {
              return Promise.resolve(Object.keys(data).map(key => data[key]));
            } else {
              return Promise.resolve([]);
            }
          });
      }

      return this.getObject(`${ownerId}/${id}`);
    },

    /**
     *
     * @param ownerId
     * @param ids
     * @returns {*} Returns a Promise or array of Promise's. The Promise resolves to the ID of the deleted item(s) or to an Error.
     */
    destroy({ ownerId, ids }) {
      if (Array.isArray(ids)) {
        if (ids.length) {
          // catch any error from remove() to prevent fast-fail by Promise.all()
          return Promise.all(ids.map(id => {
            return this.remove(`${ownerId}/${id}`)
              .then(() => id)
              .catch(caught => {
                const error: AugmentedError = new Error('Error while trying to delete. ID: ' + id);
                error.caught = caught;
                error.id = id;
                return error;
              });
          }));
        } else {
          return Promise.reject(new Error('Invalid ID'));
        }
      } else {
        return this.remove(`${ownerId}/${ids}`)
          .then(() => ids);
      }
    },
  } as BaseClient);
};

export default clientMixin;
