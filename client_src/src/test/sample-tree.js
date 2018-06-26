function randomDateString(start, end) {
  return new Date(start.getTime() +
    Math.random() * (end.getTime() - start.getTime())).toLocaleString();
}

const start = new Date(2018, 5, 1);
const end = new Date();

export default [
  {
    'title': 'react-ui-tree',
    'subtitle': randomDateString(start, end),
    'children': [
      {
        'title': 'dist',
        'subtitle': randomDateString(start, end),
        'children': [
          {
            'title': 'node.js',
            'subtitle': randomDateString(start, end),
          },
          {
            'title': 'react-ui-tree.css',
            'subtitle': randomDateString(start, end),
          },
          {
            'title': 'react-ui-tree.js',
            'subtitle': randomDateString(start, end),
          },
          {
            'title': 'tree.js',
            'subtitle': randomDateString(start, end),
          },
        ],
      },
      {
        'title': 'example',
        'subtitle': randomDateString(start, end),
        'children': [
          {
            'title': 'app.js',
            'subtitle': randomDateString(start, end),
          },
          {
            'title': 'app.less',
            'subtitle': randomDateString(start, end),
          },
          {
            'title': 'index.html',
            'subtitle': randomDateString(start, end),
          },
        ],
      },
      {
        'title': 'lib',
        'subtitle': randomDateString(start, end),
        'children': [
          {
            'title': 'node.js',
            'subtitle': randomDateString(start, end),
          },
          {
            'title': 'react-ui-tree.js',
            'subtitle': randomDateString(start, end),
          },
          {
            'title': 'react-ui-tree.less',
            'subtitle': randomDateString(start, end),
          },
          {
            'title': 'tree.js',
            'subtitle': randomDateString(start, end),
          },
        ],
      },
      {
        'title': '.gitiignore',
        'subtitle': randomDateString(start, end),
      },
      {
        'title': 'index.js',
        'subtitle': randomDateString(start, end),
      },
      {
        'title': 'LICENSE',
        'subtitle': randomDateString(start, end),
      },
      {
        'title': 'Makefile',
        'subtitle': randomDateString(start, end),
      },
      {
        'title': 'package.json',
        'subtitle': randomDateString(start, end),
      },
      {
        'title': 'README.md',
        'subtitle': randomDateString(start, end),
      },
      {
        'title': 'webpack.config.js',
        'subtitle': randomDateString(start, end),
      },
    ],
  },
];

// TODO: Remove, formerly for react-ui-tree
/*
export default {
  'module': 'react-ui-tree',
  'children': [
    {
      'module': 'dist',
      'collapsed': true,
      'children': [
        {
          'module': 'node.js',
          'leaf': true,
        },
        {
          'module': 'react-ui-tree.css',
          'leaf': true,
        },
        {
          'module': 'react-ui-tree.js',
          'leaf': true,
        },
        {
          'module': 'tree.js',
          'leaf': true,
        },
      ],
    },
    {
      'module': 'example',
      'children': [
        {
          'module': 'app.js',
          'leaf': true,
        },
        {
          'module': 'app.less',
          'leaf': true,
        },
        {
          'module': 'index.html',
          'leaf': true,
        },
      ],
    },
    {
      'module': 'lib',
      'children': [
        {
          'module': 'node.js',
          'leaf': true,
        },
        {
          'module': 'react-ui-tree.js',
          'leaf': true,
        },
        {
          'module': 'react-ui-tree.less',
          'leaf': true,
        },
        {
          'module': 'tree.js',
          'leaf': true,
        },
      ],
    },
    {
      'module': '.gitiignore',
      'leaf': true,
    },
    {
      'module': 'index.js',
      'leaf': true,
    },
    {
      'module': 'LICENSE',
      'leaf': true,
    },
    {
      'module': 'Makefile',
      'leaf': true,
    },
    {
      'module': 'package.json',
      'leaf': true,
    },
    {
      'module': 'README.md',
      'leaf': true,
    },
    {
      'module': 'webpack.config.js',
      'leaf': true,
    },
  ],
};
*/
