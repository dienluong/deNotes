import { nodeTypes } from '../../utils/appCONSTANTS';

const _ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER;

export const mockedTree = [
  {
    title: 'folder root[0]',
    subtitle: '',
    uniqid: '1',
    type: nodeTypes.FOLDER,
    get id() {
      return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
    },
    expanded: false,
    children: [
      {
        title: 'note root[0].children[0]',
        subtitle: '',
        uniqid: '2',
        type: nodeTypes.ITEM,
        get id() {
          return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
        },
      },
      {
        title: 'note root[0].children[1]',
        subtitle: '',
        uniqid: '3',
        type: nodeTypes.ITEM,
        get id() {
          return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
        },
      },
      {
        title: 'folder root[0].children[2]',
        subtitle: '',
        uniqid: '4',
        type: nodeTypes.FOLDER,
        get id() {
          return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
        },
        expanded: false,
        children: [
          {
            title: 'note root[0].children[2].children[0]',
            subtitle: '',
            uniqid: '5',
            type: nodeTypes.ITEM,
            get id() {
              return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
            },
          },
          {
            title: 'note root[0].children[2].children[1]',
            subtitle: '',
            uniqid: '6',
            type: nodeTypes.ITEM,
            get id() {
              return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
            },
          },
        ],
      },
      {
        title: 'folder root[0].children[3]',
        subtitle: '',
        uniqid: '7',
        type: nodeTypes.FOLDER,
        get id() {
          return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
        },
        expanded: false,
        children: [],
      },
    ],
  },
  {
    title: 'note root[1]',
    subtitle: '',
    uniqid: '8',
    type: nodeTypes.ITEM,
    get id() {
      return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
    },
  },
  {
    title: 'folder root[2]',
    subtitle: '',
    uniqid: '9',
    type: nodeTypes.FOLDER,
    get id() {
      return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
    },
    expanded: false,
    children: [],
  },
];
