import uniqid from 'uniqid';

function randomDateString(start, end) {
  return new Date(start.getTime() +
    Math.random() * (end.getTime() - start.getTime())).toLocaleString();
}

const start = new Date(2018, 5, 1);
const end = new Date();

export default [
  {
    title: 'react-ui-tree',
    subtitle: randomDateString(start, end),
    id: uniqid(),
    expanded: true,
    children: [
      {
        title: 'dist',
        subtitle: randomDateString(start, end),
        id: uniqid(),
        children: [
          {
            title: 'node.js',
            subtitle: randomDateString(start, end),
            id: uniqid(),
          },
          {
            title: 'react-ui-tree.css',
            subtitle: randomDateString(start, end),
            id: uniqid(),
          },
          {
            title: 'react-ui-tree.js',
            subtitle: randomDateString(start, end),
            id: uniqid(),
          },
          {
            title: 'tree.js',
            subtitle: randomDateString(start, end),
            id: uniqid(),
          },
        ],
      },
      {
        title: 'example',
        subtitle: randomDateString(start, end),
        id: uniqid(),
        children: [
          {
            title: 'app.js',
            subtitle: randomDateString(start, end),
            id: uniqid(),
          },
          {
            title: 'app.less',
            subtitle: randomDateString(start, end),
            id: uniqid(),
          },
          {
            title: 'index.html',
            subtitle: randomDateString(start, end),
            id: uniqid(),
          },
        ],
      },
      {
        title: 'lib',
        subtitle: randomDateString(start, end),
        id: uniqid(),
        children: [
          {
            title: 'node.js',
            subtitle: randomDateString(start, end),
            id: uniqid(),
          },
          {
            title: 'react-ui-tree.js',
            subtitle: randomDateString(start, end),
            id: uniqid(),
          },
          {
            title: 'react-ui-tree.less',
            subtitle: randomDateString(start, end),
            id: uniqid(),
          },
          {
            title: 'tree.js',
            subtitle: randomDateString(start, end),
            id: uniqid(),
          },
        ],
      },
      {
        title: '.gitiignore',
        subtitle: randomDateString(start, end),
        id: uniqid(),
      },
      {
        title: 'index.js',
        subtitle: randomDateString(start, end),
        id: uniqid(),
      },
      {
        title: 'LICENSE',
        subtitle: randomDateString(start, end),
        id: uniqid(),
      },
      {
        title: 'Makefile',
        subtitle: randomDateString(start, end),
        id: uniqid(),
      },
      {
        title: 'package.json',
        subtitle: randomDateString(start, end),
        id: uniqid(),
      },
      {
        title: 'README.md',
        subtitle: randomDateString(start, end),
        id: uniqid(),
      },
      {
        title: 'webpack.config.js',
        subtitle: randomDateString(start, end),
        id: uniqid(),
      },
    ],
  },
  {
    title: 'react-sortable-tree bottom',
    subtitle: randomDateString(start, end),
    id: uniqid(),
    children: [],
  },
];

