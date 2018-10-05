const moduleName = 'notes';

function builder(privateClient) {
  privateClient.declareType(moduleName, {
    'type': 'object',
    'properties': {
      'id': {
        'type': 'string',
        'pattern': '^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$',
      },
      'title': {
        'type': 'string',
      },
      'content': {
        'type': 'string',
      },
      'delta': {
        'type': 'object',
        'properties': {
          'ops': {
            'type': 'array',
            'items': {
              'type': 'object',
            },
          },
        },
      },
      'dateCreated': {
        'type': 'integer',
      },
      'dateModified': {
        'type': 'integer',
      },
      'readOnly': {
        'type': 'boolean',
      },
    },
    'required': ['id'],
  });

  const notesDecorator = {
    save({ ownerId, id, dataObj }) {
      const path = `${ownerId}/${id}`;
      return this.storeObject(moduleName, path, dataObj);
    },
    load({ ownerId, id }) {
      if (!id) {
        // getAll() is extremely poorly documented.
        // It returns an object containing all the objects stored.
        // The key is the object's path relative to the path provided to getAll().
        // We are converting the object of objects into an array.
        return this.getAll(`${ownerId}/`)
          .then(data => {
            if (typeof data === 'object') {
              return Promise.resolve(Object.keys(data).map(key => data[key]));
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
                const error = new Error('Error deleting note: ' + id);
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
  };

  const module = {
    privateContent: () => Object.assign(privateClient, notesDecorator),
  };

  return {
    exports: module,
  };
}


const notesDataModule = {
  name: moduleName,
  builder: builder,
};

export default notesDataModule;
