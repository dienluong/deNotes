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
    'expanded': true,
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

