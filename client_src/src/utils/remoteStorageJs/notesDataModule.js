import clientMixin from './clientMixin';
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

  const module = {
    privateContent: () => Object.assign(privateClient, clientMixin(moduleName)),
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
