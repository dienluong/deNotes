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
    uniqid: uniqid(),
    get id() {
      return `${this.title}~^~${this.type}~^~${this.uniqid}`;
    },
    type: 'folder',
    expanded: true,
    children: [
      {
        title: 'dist',
        subtitle: randomDateString(start, end),
        uniqid: uniqid(),
        get id() {
          return `${this.title}~^~${this.type}~^~${this.uniqid}`;
        },
        type: 'folder',
        children: [
          {
            title: 'node.js',
            subtitle: randomDateString(start, end),
            uniqid: uniqid(),
            get id() {
              return `${this.title}~^~${this.type}~^~${this.uniqid}`;
            },
            type: 'item',
          },
          {
            title: 'react-ui-tree.css',
            subtitle: randomDateString(start, end),
            uniqid: uniqid(),
            get id() {
              return `${this.title}~^~${this.type}~^~${this.uniqid}`;
            },
            type: 'item',
          },
          {
            title: 'react-ui-tree.js',
            subtitle: randomDateString(start, end),
            uniqid: uniqid(),
            get id() {
              return `${this.title}~^~${this.type}~^~${this.uniqid}`;
            },
            type: 'item',
          },
          {
            title: 'tree.js',
            subtitle: randomDateString(start, end),
            uniqid: uniqid(),
            get id() {
              return `${this.title}~^~${this.type}~^~${this.uniqid}`;
            },
            type: 'item',
          },
        ],
      },
      {
        title: 'example',
        subtitle: randomDateString(start, end),
        uniqid: uniqid(),
        get id() {
          return `${this.title}~^~${this.type}~^~${this.uniqid}`;
        },
        type: 'folder',
        children: [
          {
            title: 'app.js',
            subtitle: randomDateString(start, end),
            uniqid: uniqid(),
            get id() {
              return `${this.title}~^~${this.type}~^~${this.uniqid}`;
            },
            type: 'item',
          },
          {
            title: 'app.less',
            subtitle: randomDateString(start, end),
            uniqid: uniqid(),
            get id() {
              return `${this.title}~^~${this.type}~^~${this.uniqid}`;
            },
            type: 'item',
          },
          {
            title: 'index.html',
            subtitle: randomDateString(start, end),
            uniqid: uniqid(),
            get id() {
              return `${this.title}~^~${this.type}~^~${this.uniqid}`;
            },
            type: 'item',
          },
        ],
      },
      {
        title: 'lib',
        subtitle: randomDateString(start, end),
        uniqid: uniqid(),
        get id() {
          return `${this.title}~^~${this.type}~^~${this.uniqid}`;
        },
        type: 'folder',
        children: [
          {
            title: 'node.js',
            subtitle: randomDateString(start, end),
            uniqid: uniqid(),
            get id() {
              return `${this.title}~^~${this.type}~^~${this.uniqid}`;
            },
            type: 'item',
          },
          {
            title: 'react-ui-tree.js',
            subtitle: randomDateString(start, end),
            uniqid: uniqid(),
            get id() {
              return `${this.title}~^~${this.type}~^~${this.uniqid}`;
            },
            type: 'item',
          },
          {
            title: 'react-ui-tree.less',
            subtitle: randomDateString(start, end),
            uniqid: uniqid(),
            get id() {
              return `${this.title}~^~${this.type}~^~${this.uniqid}`;
            },
            type: 'item',
          },
          {
            title: 'tree.js',
            subtitle: randomDateString(start, end),
            uniqid: uniqid(),
            get id() {
              return `${this.title}~^~${this.type}~^~${this.uniqid}`;
            },
            type: 'item',
          },
        ],
      },
      {
        title: '.gitiignore',
        subtitle: randomDateString(start, end),
        uniqid: uniqid(),
        get id() {
          return `${this.title}~^~${this.type}~^~${this.uniqid}`;
        },
        type: 'item',
      },
      {
        title: 'index.js',
        subtitle: randomDateString(start, end),
        uniqid: uniqid(),
        get id() {
          return `${this.title}~^~${this.type}~^~${this.uniqid}`;
        },
        type: 'item',
      },
      {
        title: 'LICENSE',
        subtitle: randomDateString(start, end),
        uniqid: uniqid(),
        get id() {
          return `${this.title}~^~${this.type}~^~${this.uniqid}`;
        },
        type: 'item',
      },
      {
        title: 'Makefile',
        subtitle: randomDateString(start, end),
        uniqid: uniqid(),
        get id() {
          return `${this.title}~^~${this.type}~^~${this.uniqid}`;
        },
        type: 'item',
      },
      {
        title: 'package.json',
        subtitle: randomDateString(start, end),
        uniqid: uniqid(),
        get id() {
          return `${this.title}~^~${this.type}~^~${this.uniqid}`;
        },
        type: 'item',
      },
      {
        title: 'README.md',
        subtitle: randomDateString(start, end),
        uniqid: uniqid(),
        get id() {
          return `${this.title}~^~${this.type}~^~${this.uniqid}`;
        },
        type: 'item',
      },
      {
        title: 'webpack.config.js',
        subtitle: randomDateString(start, end),
        uniqid: uniqid(),
        get id() {
          return `${this.title}~^~${this.type}~^~${this.uniqid}`;
        },
        type: 'item',
      },
    ],
  },
  {
    title: 'react-sortable-tree bottom',
    subtitle: randomDateString(start, end),
    uniqid: uniqid(),
    get id() {
      return `${this.title}~^~${this.type}~^~${this.uniqid}`;
    },
    type: 'folder',
    children: [],
  },
  {
    title: 'QuillJS',
    subtitle: randomDateString(start, end),
    uniqid: uniqid(),
    get id() {
      return `${this.title}~^~${this.type}~^~${this.uniqid}`;
    },
    type: 'item',
  },
];

