const moduleName = 'trees';

function builder(privateClient) {
  privateClient.declareType(moduleName, {
    'type': 'object',
    'properties': {
      'id': {
        'type': 'string',
      },
      'tree': {
        'type': 'array',
        'items': {
          'type': 'object',
          'properties': {
            'id': {
              'type': 'string',
            },
            'uniqid': {
              'type': 'string',
            },
            'title': {
              'type': 'string',
            },
            'subtitle': {
              'type': 'string',
            },
            'type': {
              'type': 'string',
            },
            'expanded': {
              'type': 'boolean',
            },
            'children': {
              'type': 'array',
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
      'ownerId': {
        'type': 'string',
      },
    },
    'required': ['id', 'tree'],
  });

  const treesDecorator = {
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
    destroy({ ownerId, ids }) {
      if (Array.isArray(ids)) {
        if (ids.length) {
          // catch any error from remove() to prevent fast-fail by Promise.all()
          return Promise.all(ids.map(id => {
            return this.remove(`${ownerId}/${id}`)
              .then(() => id)
              .catch(caught => {
                const error = new Error('Error deleting tree: ' + id);
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
    privateContent: () => Object.assign(privateClient, treesDecorator),
  };

  return {
    exports: module,
  };
}


const treesDataModule = {
  name: moduleName,
  builder: builder,
};

export default treesDataModule;
