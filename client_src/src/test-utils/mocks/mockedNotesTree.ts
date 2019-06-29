import { nodeTypes } from '../../utils/appCONSTANTS';

const _ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER;

export const mockedTree: TreeNodeT[] = [
  {
    title: 'folder root0',
    subtitle: '',
    uniqid: '1',
    type: nodeTypes.FOLDER,
    get id() {
      return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
    },
    expanded: true,
    children: [
      {
        title: 'note root0.children0',
        subtitle: '',
        uniqid: '2',
        type: nodeTypes.ITEM,
        get id() {
          return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
        },
      },
      {
        title: 'note root0.children1',
        subtitle: '',
        uniqid: '3',
        type: nodeTypes.ITEM,
        get id() {
          return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
        },
      },
      {
        title: 'folder root0.children2',
        subtitle: '',
        uniqid: '4',
        type: nodeTypes.FOLDER,
        get id() {
          return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
        },
        expanded: true,
        children: [
          {
            title: 'note root0.children2.children0',
            subtitle: '',
            uniqid: '5',
            type: nodeTypes.ITEM,
            get id() {
              return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
            },
          },
          {
            title: 'note root0.children2.children1',
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
        title: 'folder root0.children3',
        subtitle: '',
        uniqid: '7',
        type: nodeTypes.FOLDER,
        get id() {
          return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
        },
        expanded: true,
        children: [],
      },
    ],
  },
  {
    title: 'note root1',
    subtitle: '',
    uniqid: '8',
    type: nodeTypes.ITEM,
    get id() {
      return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
    },
  },
  {
    title: 'folder root2',
    subtitle: '',
    uniqid: '9',
    type: nodeTypes.FOLDER,
    get id() {
      return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
    },
    expanded: true,
    children: [],
  },
];
