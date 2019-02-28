import uuid from 'uuid/v1';
import { nodeTypes } from '../utils/appCONSTANTS';

function randomDateString(start, end) {
  return new Date(start.getTime() +
    Math.random() * (end.getTime() - start.getTime())).toLocaleString();
}

const start = new Date(2018, 5, 1);
const end = new Date();
const _ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER;

export default [
  {
    title: 'react-ui-tree',
    subtitle: randomDateString(start, end),
    uniqid: uuid(),
    get id() {
      return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
    },
    type: nodeTypes.FOLDER,
    expanded: true,
    children: [
      {
        title: 'dist',
        subtitle: randomDateString(start, end),
        uniqid: uuid(),
        get id() {
          return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
        },
        type: nodeTypes.FOLDER,
        children: [
          {
            title: 'node.js',
            subtitle: randomDateString(start, end),
            uniqid: uuid(),
            get id() {
              return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
            },
            type: nodeTypes.ITEM,
          },
          {
            title: 'react-ui-tree.css',
            subtitle: randomDateString(start, end),
            uniqid: uuid(),
            get id() {
              return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
            },
            type: nodeTypes.ITEM,
          },
          {
            title: 'react-ui-tree.js',
            subtitle: randomDateString(start, end),
            uniqid: uuid(),
            get id() {
              return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
            },
            type: nodeTypes.ITEM,
          },
          {
            title: 'tree.js',
            subtitle: randomDateString(start, end),
            uniqid: uuid(),
            get id() {
              return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
            },
            type: nodeTypes.ITEM,
          },
        ],
      },
      {
        title: 'example',
        subtitle: randomDateString(start, end),
        uniqid: uuid(),
        get id() {
          return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
        },
        type: nodeTypes.FOLDER,
        children: [
          {
            title: 'app.js',
            subtitle: randomDateString(start, end),
            uniqid: uuid(),
            get id() {
              return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
            },
            type: nodeTypes.ITEM,
          },
          {
            title: 'app.less',
            subtitle: randomDateString(start, end),
            uniqid: uuid(),
            get id() {
              return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
            },
            type: nodeTypes.ITEM,
          },
          {
            title: 'index.html',
            subtitle: randomDateString(start, end),
            uniqid: uuid(),
            get id() {
              return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
            },
            type: nodeTypes.ITEM,
          },
        ],
      },
      {
        title: 'lib',
        subtitle: randomDateString(start, end),
        uniqid: uuid(),
        get id() {
          return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
        },
        type: nodeTypes.FOLDER,
        children: [
          {
            title: 'node.js',
            subtitle: randomDateString(start, end),
            uniqid: uuid(),
            get id() {
              return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
            },
            type: nodeTypes.ITEM,
          },
          {
            title: 'react-ui-tree.js',
            subtitle: randomDateString(start, end),
            uniqid: uuid(),
            get id() {
              return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
            },
            type: nodeTypes.ITEM,
          },
          {
            title: 'react-ui-tree.less',
            subtitle: randomDateString(start, end),
            uniqid: uuid(),
            get id() {
              return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
            },
            type: nodeTypes.ITEM,
          },
          {
            title: 'tree.js',
            subtitle: randomDateString(start, end),
            uniqid: uuid(),
            get id() {
              return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
            },
            type: nodeTypes.ITEM,
          },
        ],
      },
      {
        title: '.gitiignore',
        subtitle: randomDateString(start, end),
        uniqid: uuid(),
        get id() {
          return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
        },
        type: nodeTypes.ITEM,
      },
      {
        title: 'index.js',
        subtitle: randomDateString(start, end),
        uniqid: uuid(),
        get id() {
          return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
        },
        type: nodeTypes.ITEM,
      },
      {
        title: 'LICENSE',
        subtitle: randomDateString(start, end),
        uniqid: uuid(),
        get id() {
          return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
        },
        type: nodeTypes.ITEM,
      },
      {
        title: 'Makefile',
        subtitle: randomDateString(start, end),
        uniqid: uuid(),
        get id() {
          return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
        },
        type: nodeTypes.ITEM,
      },
      {
        title: 'package.json',
        subtitle: randomDateString(start, end),
        uniqid: uuid(),
        get id() {
          return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
        },
        type: nodeTypes.ITEM,
      },
      {
        title: 'README.md',
        subtitle: randomDateString(start, end),
        uniqid: uuid(),
        get id() {
          return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
        },
        type: nodeTypes.ITEM,
      },
      {
        title: 'webpack.config.js',
        subtitle: randomDateString(start, end),
        uniqid: uuid(),
        get id() {
          return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
        },
        type: nodeTypes.ITEM,
      },
    ],
  },
  {
    title: 'react-sortable-tree bottom',
    subtitle: randomDateString(start, end),
    uniqid: uuid(),
    get id() {
      return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
    },
    type: nodeTypes.FOLDER,
    children: [],
  },
  {
    title: 'QuillJS',
    subtitle: randomDateString(start, end),
    uniqid: uuid(),
    get id() {
      return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
    },
    type: nodeTypes.ITEM,
  },
];

