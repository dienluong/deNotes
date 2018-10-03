const moduleName = 'trees';

function builder(privateClient) {
  privateClient.declareType(moduleName, {
    'type': 'object',
    'properties': {
      'id': {
        'type': 'integer',
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
        'type': 'integer',
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
        return this.getAll(`${ownerId}/`);
      }

      return this.getObject(`${ownerId}/${id}`);
    },
    destroy({ ownerId, ids }) {
      if (!ids) {
        return this.remote(`${ownerId}`);
      }

      if (Array.isArray(ids)) {
        if (ids.length) {
          // catch any error from remove() to prevent fast-fail by Promise.all()
          return Promise.all(ids.map(id => this.remove(`${ownerId}/${id}`).catch(err => err)));
        } else {
          return Promise.reject(new Error('Invalid ID'));
        }
      } else {
        return this.remove(`${ownerId}/${ids}`);
      }
    },
  };

  const module = {
    privateContent: () => Object.assign(privateClient.scope(`${moduleName}/`), treesDecorator),
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
