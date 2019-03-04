import reducer from './notesTreeReducer';
import notesListActionTypes from '../actions/constants/notesListActionConstants';
import initialState from '../misc/initialState';
import { nodeTypes } from '../../utils/appCONSTANTS';

describe('notesTreeReducer ', () => {
  const currentTree = [
    {
      title: 'test root folder 1',
      subtitle: 'test root folder 1 subtitle',
      uniqid: 'my-test-root-folder-1',
      get id() {
        return `${this.type}-${this.uniqid}`;
      },
      type: nodeTypes.FOLDER,
      expanded: true,
      children: [
        {
          title: 'test child 0',
          subtitle: 'test child subtitle 0',
          uniqid: 'my-test-child-0',
          get id() {
            return `${this.type}-${this.uniqid}`;
          },
          type: nodeTypes.ITEM,
        },
        {
          title: 'test child 1',
          subtitle: 'test child subtitle 1',
          uniqid: 'my-test-child-1',
          get id() {
            return `${this.type}-${this.uniqid}`;
          },
          type: nodeTypes.FOLDER,
          expanded: true,
          children: [
            {
              title: 'test grandchild 0',
              subtitle: 'test grandchild subtitle 0',
              uniqid: 'my-test-grandchild-0',
              get id() {
                return `${this.type}-${this.uniqid}`;
              },
              type: nodeTypes.ITEM,
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
          type: nodeTypes.ITEM,
        },
      ],
    },
    {
      title: 'test root item 1',
      subtitle: 'test root item 1 subtitle',
      uniqid: 'my-test-root-item-1',
      get id() {
        return `${this.type}-${this.uniqid}`;
      },
      type: nodeTypes.ITEM,
    },
  ];

  const currentState = {
    id: 'my-current-state',
    tree: currentTree,
    dateCreated: 10,
    dateModified: 20,
  };

  it('should return the initial state by default', () => {
    expect(reducer(undefined, {})).toEqual(initialState.notesTree);
  });

  it('should return current state if no payload received', () => {
    const currentState = {
      id: 'current tree ID',
      tree: [{ id: '1' }, { id: '2' }],
      dateCreated: 12340,
      dateModified: 56789,
    };
    expect(reducer(currentState, { type: notesListActionTypes.CHANGE_NOTES_TREE })).toBe(currentState);
  });

  it('should return the received tree on CHANGE_NOTES_TREE', () => {
    const newTree = [
      {
        title: 'new test tree',
        subtitle: 'new test tree subtitle',
        uniqid: 'my-new-test-tree',
        get id() {
          return `${this.type}-${this.uniqid}`;
        },
        type: nodeTypes.FOLDER,
        expanded: true,
        children: [
          {
            title: 'new test child 1',
            subtitle: 'new test child subtitle 1',
            uniqid: 'my-new-test-child-1',
            get id() {
              return `${this.type}-${this.uniqid}`;
            },
            type: nodeTypes.FOLDER,
            expanded: false,
            children: [],
          },
          {
            title: 'new test child 2',
            subtitle: 'new test child subtitle 2',
            uniqid: 'my-new-test-child-2',
            get id() {
              return `${this.type}-${this.uniqid}`;
            },
            type: nodeTypes.ITEM,
          },
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
    const expectedDate = 20202;
    const newTitle = 'a new title';
    const newTree = [
      {
        ...currentTree[0],
        children: [
          currentTree[0].children[0],
          {
            ...currentTree[0].children[1],
            title: newTitle,
          },
          currentTree[0].children[2],
        ],
      },
      currentTree[1],
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
        now: expectedDate,
      },
    })).toEqual(newState);

    // if node invalid, return current state
    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NODE_TITLE,
      payload: {
        title: newTitle,
        now: expectedDate,
        node: [{ id: 'invalid node' }],
      },
    })).toBe(currentState);

    // if node not found in tree, return current state
    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NODE_TITLE,
      payload: {
        title: newTitle,
        now: expectedDate,
        node: { id: 'not in tree ID' },
      },
    })).toBe(currentState);
  });

  it('should, on DELETE_NODE, return a tree with the specified node removed.', () => {
    const expectedDate = 3003;
    // New tree is current tree but with one node removed
    const newTree = [
      {
        ...currentTree[0],
        children: [
          currentTree[0].children[0],
          // currentTree[0].children[1] removed
          currentTree[0].children[2],
        ],
      },
      currentTree[1],
    ];
    const newState = {
      ...currentState,
      tree: newTree,
      dateModified: expectedDate,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.DELETE_NODE,
      payload: {
        nodeToDelete: currentTree[0].children[1],
        activePath: [currentTree[0].id, currentTree[0].children[1].id],
        now: expectedDate,
      },
    })).toEqual(newState);
  });

  it('should, on CHANGE_NOTES_TREE_FOLDER, return modified tree from received node', () => {
    const expectedDate = 4554;
    let newFolder = [
      {
        title: 'new test grandchild 0',
        subtitle: 'new test grandchild subtitle 0',
        uniqid: 'my-new-test-grandchild-0',
        get id() {
          return `${this.type}-${this.uniqid}`;
        },
        type: nodeTypes.ITEM,
      },
      {
        title: 'new test grandchild 1',
        subtitle: 'new test grandchild subtitle 1',
        uniqid: 'my-new-test-grandchild-1',
        get id() {
          return `${this.type}-${this.uniqid}`;
        },
        type: nodeTypes.ITEM,
      },
      {
        title: 'new test grandchild 2',
        subtitle: 'new test grandchild subtitle 2',
        uniqid: 'my-new-test-grandchild-2',
        get id() {
          return `${this.type}-${this.uniqid}`;
        },
        type: nodeTypes.ITEM,
      },
    ];
    let newTree = [
      {
        ...currentTree[0],
        children: [
          currentTree[0].children[0],
          {
            ...currentTree[0].children[1],
            children: newFolder,
          },
          currentTree[0].children[2],
        ],
      },
      currentTree[1],
    ];
    let newState = {
      ...currentState,
      tree: newTree,
      dateModified: expectedDate,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NOTES_TREE_FOLDER,
      payload: {
        folder: newFolder,
        activePath: [currentTree[0].id, currentTree[0].children[1].id, currentTree[0].children[1].children[0].id],
        now: expectedDate,
      },
    })).toEqual(newState);

    // should work with empty new folder as well. Here, we are replacing root folder
    newFolder = [];
    newTree = [];
    newState = {
      ...currentState,
      tree: newTree,
      dateModified: expectedDate,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NOTES_TREE_FOLDER,
      payload: {
        folder: newFolder,
        activePath: [currentTree[1].id],
        now: expectedDate,
      },
    })).toEqual(newState);

    // should return current state if folder is invalid (valid folder must be an array)
    newFolder = { id: 'invalid folder' };
    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NOTES_TREE_FOLDER,
      payload: {
        folder: newFolder,
        activePath: [currentTree[0].id, currentTree[0].children[2].id],
        now: expectedDate,
      },
    })).toBe(currentState);

    // should return current state if given path does not lead to folder in tree
    newFolder = [];
    let invalidActivePath = [currentTree[0].id, `${nodeTypes.FOLDER}-non-existent-id`, currentTree[0].children[1].children[0].id];
    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NOTES_TREE_FOLDER,
      payload: {
        folder: newFolder,
        activePath: invalidActivePath,
        now: expectedDate,
      },
    })).toBe(currentState);
  });
});
