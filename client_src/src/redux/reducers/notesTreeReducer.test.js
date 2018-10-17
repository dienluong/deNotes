import reducer from './notesTreeReducer';
import notesListActionTypes from '../actions/constants/notesListActionConstants';
import initialState from '../misc/initialState';

describe('notesTreeReducer', () => {
  const RealDate = global.Date;

  afterEach(() => {
    global.Date = RealDate;
  });

  it('should return the initial state by default', () => {
    expect(reducer(undefined, {})).toEqual(initialState.notesTree);
  });

  it('should, on CHANGE_NOTES_TREE, return the received tree', () => {
    const currentTree = [
      {
        title: 'test tree',
        subtitle: 'test tree subtitle',
        uniqid: 'my-test-tree',
        get id() {
          return `${this.type}-${this.uniqid}`;
        },
        type: 'folder',
        expanded: true,
        children: [
          {
            title: 'test child',
            subtitle: 'test child subtitle',
            uniqid: 'my-test-child',
            get id() {
              return `${this.type}-${this.uniqid}`;
            },
            type: 'item',
          },
        ],
      },
    ];

    const currentState = {
      id: 'my-current-state',
      tree: currentTree,
      dateCreated: 10,
      dateModified: 20,
    };
    const newTree = [
      {
        title: 'new test tree',
        subtitle: 'new test tree subtitle',
        uniqid: 'my-new-test-tree',
        get id() {
          return `${this.type}-${this.uniqid}`;
        },
        type: 'folder',
        expanded: true,
        children: [
          {
            title: 'test child 1',
            subtitle: 'test child subtitle 1',
            uniqid: 'my-test-child-1',
            get id() {
              return `${this.type}-${this.uniqid}`;
            },
            type: 'folder',
            expanded: false,
            children: [],
          },
          {

            title: 'test child 2',
            subtitle: 'test child subtitle 2',
            uniqid: 'my-test-child-2',
            get id() {
              return `${this.type}-${this.uniqid}`;
            },
            type: 'item',
          }
        ],
      },
    ];
    const newState = {
      id: 'my-new-state',
      tree: newTree,
      dateCreated: 101,
      dateModified: 202,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NOTES_TREE,
      payload: {
        notesTree: newState,
      },
    })).toEqual({
      ...currentState,
      ...newState,
    });
  });

  it('should, on CHANGE_NODE_TITLE, return a tree with the title of specified node changed', () => {
    const expectedDate = 2002;
    global.Date = class extends RealDate {
      constructor() {
        super(expectedDate);
      }
      static now() {
        return expectedDate;
      }
    };

    const currentTree = [
      {
        title: 'test tree',
        subtitle: 'test tree subtitle',
        uniqid: 'my-test-tree',
        get id() {
          return `${this.type}-${this.uniqid}`;
        },
        type: 'folder',
        expanded: true,
        children: [
          {
            title: 'test child 1',
            subtitle: 'test child subtitle 1',
            uniqid: 'my-test-child-1',
            get id() {
              return `${this.type}-${this.uniqid}`;
            },
            type: 'folder',
            expanded: false,
            children: [],
          },
          {

            title: 'test child 2',
            subtitle: 'test child subtitle 2',
            uniqid: 'my-test-child-2',
            get id() {
              return `${this.type}-${this.uniqid}`;
            },
            type: 'item',
          },
        ],
      },
    ];

    const currentState = {
      id: 'my-current-state',
      tree: currentTree,
      dateCreated: 10,
      dateModified: 20,
    };

    const newTitle = 'a new title';
    const newTree = [
      {
        ...currentTree[0],
        children: [
          {
            ...currentTree[0].children[0],
          },
          {
            ...currentTree[0].children[1],
            title: newTitle,
          },
        ],
      },
    ];
    const newState = {
      ...currentState,
      tree: newTree,
      dateModified: expectedDate,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NODE_TITLE,
      payload: {
        title: newTitle,
        node: currentTree[0].children[1],
        path: [currentTree[0].id, currentTree[0].children[1].id],
      },
    })).toEqual(newState);
  });

  it('should, on DELETE_NODE, return a tree with the specified node removed.', () => {
    const expectedDate = 3003;
    global.Date = class extends RealDate {
      constructor() {
        super(expectedDate);
      }
      static now() {
        return expectedDate;
      }
    };

    const currentTree = [
      {
        title: 'test tree',
        subtitle: 'test tree subtitle',
        uniqid: 'my-test-tree',
        get id() {
          return `${this.type}-${this.uniqid}`;
        },
        type: 'folder',
        expanded: true,
        children: [
          {
            title: 'test child 1',
            subtitle: 'test child subtitle 1',
            uniqid: 'my-test-child-1',
            get id() {
              return `${this.type}-${this.uniqid}`;
            },
            type: 'folder',
            expanded: true,
            children: [
              {
                title: 'test grandchild 1',
                subtitle: 'test grandchild subtitle 1',
                uniqid: 'my-test-grandchild-1',
                get id() {
                  return `${this.type}-${this.uniqid}`;
                },
                type: 'item',
              },
            ],
          },
          {

            title: 'test child 2',
            subtitle: 'test child subtitle 2',
            uniqid: 'my-test-child-2',
            get id() {
              return `${this.type}-${this.uniqid}`;
            },
            type: 'item',
          },
        ],
      },
    ];

    const currentState = {
      id: 'my-current-state',
      tree: currentTree,
      dateCreated: 101,
      dateModified: 202,
    };

    const newTree = [
      {
        ...currentTree[0],
        children: [
          {
            ...currentTree[0].children[1],
          },
        ],
      },
    ];
    const newState = {
      ...currentState,
      tree: newTree,
      dateModified: expectedDate,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.DELETE_NODE,
      payload: {
        node: currentTree[0].children[0],
        path: [currentTree[0].id, currentTree[0].children[0].id],
      },
    })).toEqual(newState);
  });
});
