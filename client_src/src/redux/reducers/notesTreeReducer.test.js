import reducer from './notesTreeReducer';
import notesListActionTypes from '../actions/constants/notesListActionConstants';
import initialState from '../misc/initialState';
import { nodeTypes, NONE_SELECTED } from '../../utils/appCONSTANTS';
import { mockedTree } from '../../test-utils/mocks/mockedNotesTree';
import { createNode } from '../../utils/treeUtils';
jest.mock('uuid/v4');
import uuid from 'uuid/v4';

describe('notesTreeReducer ', () => {
  let currentTree, currentState;

  beforeEach(() => {
    // make a copy of the mocked tree
    currentTree = JSON.parse(JSON.stringify(mockedTree));
    currentState = {
      id: 'my-current-state',
      tree: currentTree,
      editMode: false,
      editModeSelectedNodes: [],
      dateCreated: 1000,
      dateModified: 2000,
    };
  });

  it('should return the initial state by default', () => {
    expect(reducer(undefined, {})).toEqual(initialState.notesTree);
  });

  it('should return current state if no payload received', () => {
    currentState = {
      ...currentState,
      id: 'current tree ID',
      dateCreated: 12340,
      dateModified: 56789,
    };
    expect(reducer(currentState, { type: notesListActionTypes.CHANGE_NOTES_TREE })).toBe(currentState);
  });

  describe('on ADD_NODE', () => {
    afterEach(() => {
      uuid.mockClear();
    });

    // on ADD_NODE...
    it('should return new tree w/ ITEM node added to location specified by parentKey', () => {
      let expectedDate = 40404;
      let newNodeKind = nodeTypes.ITEM;
      const uniqid = 'newly-created-node-uniqid';
      const currentTree = currentState.tree;

      // Case 1 ---> test case where parent key is ID of a FOLDER
      let parentKey = currentTree[0].children[3].id;

      // Mock the uuid implementation to return a predictable ID we can verify with the assertion.
      uuid.mockImplementation(() => uniqid);
      let newNode = createNode({ type: newNodeKind });
      uuid.mockClear();

      // Build expected new tree -- new node expected to be added at location given by parent key
      let expectedNewTree = JSON.parse(JSON.stringify(currentTree));
      expectedNewTree[0].children[3].children.push(newNode);
      expectedNewTree[0].children[3].expanded = true;

      let expectedNotesTree = {
        ...currentState,
        tree: expectedNewTree,
        dateModified: expectedDate,
      };

      expect(reducer(currentState, {
        type: notesListActionTypes.ADD_NODE,
        payload: {
          newNode,
          parentKey,
          now: expectedDate,
        },
      })).toEqual(expectedNotesTree);

      // Case 2 ---> test case where parentKey is empty string -- new node expected to be added at root
      parentKey = '';
      // Build the expected new tree
      expectedNewTree = JSON.parse(JSON.stringify(currentTree));
      expectedNewTree.push(newNode);

      expectedDate = 753753;
      expectedNotesTree = {
        ...currentState,
        tree: expectedNewTree,
        dateModified: expectedDate,
      };

      expect(reducer(currentState, {
        type: notesListActionTypes.ADD_NODE,
        payload: {
          newNode,
          parentKey,
          now: expectedDate,
        },
      })).toEqual(expectedNotesTree);
    });

    // on ADD_NODE...
    it('should return current state if parentKey is invalid', () => {
      let newNodeKind = nodeTypes.ITEM;
      const uniqid = 'newly-created-node-uniqid';

      // Mock the uuid implementation to return a predictable ID we can verify with the assertion.
      uuid.mockImplementation(() => uniqid);
      let newNode = createNode({ type: newNodeKind });
      uuid.mockClear();

      // ---> test case where parentKey is undefined
      let parentKey = undefined;

      expect(reducer(currentState, {
        type: notesListActionTypes.ADD_NODE,
        payload: {
          newNode,
          parentKey,
          now: 123456,
        },
      })).toBe(currentState);

      // ---> test case where parentKey is null
      parentKey = null;
      expect(reducer(currentState, {
        type: notesListActionTypes.ADD_NODE,
        payload: {
          newNode,
          parentKey,
          now: 24680,
        },
      })).toBe(currentState);

      // ---> test case where parentKey is not a string
      parentKey = 10;
      expect(reducer(currentState, {
        type: notesListActionTypes.ADD_NODE,
        payload: {
          newNode,
          parentKey,
          now: 369,
        },
      })).toBe(currentState);
    });
  });
  // END: on ADD_NODE

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
            expanded: true,
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
    const expectedNewState = {
      id: 'my-new-state',
      tree: newTree,
      dateCreated: 102030,
      dateModified: 302010,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NOTES_TREE,
      payload: {
        notesTree: expectedNewState,
      },
    })).toEqual({
      ...currentState,
      ...expectedNewState,
    });
  });

  it('should, on CHANGE_NODE_TITLE, return a tree with the title of specified node changed', () => {
    const expectedDate = 20202;
    const newTitle = 'a new title';
    const expectedNewTree = JSON.parse(JSON.stringify(currentTree));
    expectedNewTree[0].children[3].title = newTitle;
    const expectedNewState = {
      ...currentState,
      tree: expectedNewTree,
      dateModified: expectedDate,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NODE_TITLE,
      payload: {
        title: newTitle,
        node: currentTree[0].children[3],
        now: expectedDate,
      },
    })).toEqual(expectedNewState);

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

    // if new title same as current, return current state
    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NODE_TITLE,
      payload: {
        title: currentTree[0].children[1].title,
        node: currentTree[0].children[1],
        now: expectedDate,
      },
    })).toBe(currentState);
  });

  it('should, on DELETE_NODE, return a tree with the specified nodes removed.', () => {
    const expectedDate = 300300;
    // New tree is current tree but with two nodes removed. (Using parse.stringify to make a copy of currentTree.)
    const expectedNewTree = JSON.parse(JSON.stringify(currentTree));
    // select first and last nodes for deletion; should work even if some IDs are missing from tree
    const nodesToDelete = [(expectedNewTree.shift()).id, (expectedNewTree.pop()).id, 'non-existant ID'];
    const expectedNewState = {
      ...currentState,
      editMode: true,
      editModeSelectedNodes: [],
      tree: expectedNewTree,
      dateModified: expectedDate,
    };

    expect(reducer({
      ...currentState,
      editMode: true,
      editModeSelectedNodes: nodesToDelete,
    }, {
      type: notesListActionTypes.DELETE_NODE,
      payload: {
        now: expectedDate,
      },
    })).toEqual(expectedNewState);

    // And should return current state if no node selected for deletion
    currentState = {
      ...currentState,
      editMode: true,
      editModeSelectedNodes: [],
    };
    expect(reducer(currentState, {
      type: notesListActionTypes.DELETE_NODE,
      payload: {
        now: expectedDate,
      },
    })).toBe(currentState);
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
    let expectedNewTree = JSON.parse(JSON.stringify(currentTree));
    expectedNewTree[0].children[2].children = newFolder;
    let expectedNewState = {
      ...currentState,
      tree: expectedNewTree,
      dateModified: expectedDate,
    };

    // active node is the actual folder to be replaced
    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NOTES_TREE_FOLDER,
      payload: {
        folder: newFolder,
        activePath: [currentTree[0].id, currentTree[0].children[2].id, currentTree[0].children[2]],
        now: expectedDate,
      },
    })).toEqual(expectedNewState);

    // active node is one of the children of the folder to be replaced
    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NOTES_TREE_FOLDER,
      payload: {
        folder: newFolder,
        activePath: [currentTree[0].id, currentTree[0].children[2].id, currentTree[0].children[2].children[0].id],
        now: expectedDate,
      },
    })).toEqual(expectedNewState);

    // should work with empty new folder as well. Here, we are replacing root folder
    newFolder = [];
    expectedNewTree = newFolder;
    expectedNewState = {
      ...currentState,
      tree: expectedNewTree,
      dateModified: expectedDate,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NOTES_TREE_FOLDER,
      payload: {
        folder: newFolder,
        activePath: [currentTree[1].id],
        now: expectedDate,
      },
    })).toEqual(expectedNewState);

    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NOTES_TREE_FOLDER,
      payload: {
        folder: newFolder,
        activePath: [NONE_SELECTED],
        now: expectedDate,
      },
    })).toEqual(expectedNewState);

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
    let invalidActivePath = [currentTree[0].id, `${nodeTypes.FOLDER}-non-existent-id`, currentTree[0].children[2].children[0].id];
    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NOTES_TREE_FOLDER,
      payload: {
        folder: newFolder,
        activePath: invalidActivePath,
        now: expectedDate,
      },
    })).toBe(currentState);
  });

  it('should, on SET_EDIT_MODE, return state with updated Edit Mode indicator', () => {
    expect(reducer(currentState, {
      type: notesListActionTypes.SET_EDIT_MODE,
      payload: {
        value: true,
      },
    })).toEqual({
      ...currentState,
      editMode: true,
      editModeSelectedNodes: [],
    });

    expect(reducer(currentState, {
      type: notesListActionTypes.SET_EDIT_MODE,
      payload: {
        value: false,
      },
    })).toBe(currentState);

    currentState = {
      ...currentState,
      editMode: true,
      editModeSelectedNodes: ['ID 1', 'ID 2'],
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.SET_EDIT_MODE,
      payload: {
        value: true,
      },
    })).toBe(currentState);

    expect(reducer(currentState, {
      type: notesListActionTypes.SET_EDIT_MODE,
      payload: {
        value: false,
      },
    })).toEqual({
      ...currentState,
      editMode: false,
      editModeSelectedNodes: [],
    });
  });

  it('should, on EDIT_MODE_SELECT_NODE, remove or add accordingly the given node ID from the list of selected nodes', () => {
    const selectedNode = {
      nodeId: mockedTree[0].children[2].children[0].id,
      path: [mockedTree[0].id, mockedTree[0].children[2].id, mockedTree[0].children[2].children[0].id],
    };

    let action = {
      type: notesListActionTypes.EDIT_MODE_SELECT_NODE,
      payload: selectedNode,
    };

    // should add selected node ID to editModeSelectedNodes
    expect(reducer(currentState, action)).toEqual({
      ...currentState,
      editModeSelectedNodes: [selectedNode.nodeId],
    });

    // should remove node ID from editModeSelectedNodes
    expect(reducer({
      ...currentState,
      editMode: true,
      editModeSelectedNodes: [selectedNode.nodeId],
    }, action)).toEqual({
      ...currentState,
      editMode: true,
      editModeSelectedNodes: [],
    });

    // returns current state if selected node does not exist in tree
    action = {
      ...action,
      payload: {
        nodeId: 'fake ID',
        path: ['fake path', 'fake ID'],
      },
    };
    expect(reducer(currentState, action)).toBe(currentState);
  });
});

