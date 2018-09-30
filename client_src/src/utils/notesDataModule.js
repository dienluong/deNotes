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
      const path = `${ownerId}/${id}`;
      return this.getObject(path);
    },
    destroy({ ownerId, ids }) {
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
    privateContent: () => Object.assign(privateClient.scope(`${moduleName}/`), notesDecorator),
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
