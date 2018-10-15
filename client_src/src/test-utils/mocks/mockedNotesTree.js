const _ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER;

export const mockedTree = [
  {
    title: '/',
    subtitle: '',
    uniqid: '1',
    type: 'folder',
    get id() {
      return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
    },
    expanded: true,
    children: [
      {
        title: 'note 1',
        subtitle: '',
        uniqid: '2',
        type: 'item',
        get id() {
          return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
        },
      },
      {
        title: 'note 2',
        subtitle: '',
        uniqid: '3',
        type: 'item',
        get id() {
          return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
        },
      },
      {
        title: 'subfolder 1',
        subtitle: '',
        uniqid: '4',
        type: 'folder',
        get id() {
          return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
        },
        expanded: true,
        children: [
          {
            title: 'subnote 1',
            subtitle: '',
            uniqid: '5',
            type: 'item',
            get id() {
              return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
            },
          },
          {
            title: 'subnote 2',
            subtitle: '',
            uniqid: '6',
            type: 'item',
            get id() {
              return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
            },
          },
        ],
      },
      {
        title: 'subfolder 2',
        subtitle: '',
        uniqid: '7',
        type: 'folder',
        get id() {
          return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
        },
        expanded: false,
        children: [],
      },
    ],
  },
];