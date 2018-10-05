import clientMixin from './clientMixin';
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

  const module = {
    privateContent: () => Object.assign(privateClient, clientMixin(moduleName)),
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
