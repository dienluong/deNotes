import reducer from './reducedReducer';
import notesListActionTypes from '../actions/constants/notesListActionConstants';
import initialState from '../misc/initialState';
jest.mock('uuid/v4');
import uuid from 'uuid/v4';
import { createNode } from '../../utils/treeUtils';
import { nodeTypes, NONE_SELECTED } from '../../utils/appCONSTANTS';
import { mockedTree } from '../../test-utils/mocks/mockedNotesTree';

describe('reducedReducer', () => {
  const notesTree = {
    id: 'current-tree-id',
    tree: mockedTree,
    dateCreated: 11,
    dateModified: 22,
  };

  // No node selected by default
  const activeNode = {
    id: NONE_SELECTED,
    path: [NONE_SELECTED],
  };

  let currentState;

  beforeEach(() => {
    currentState = {
      ...initialState,
      notesTree,
      activeNode,
    };
  });
  afterEach(() => {
    uuid.mockClear();
  });

  it('should return the initial state by default', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should return current state if no payload', () => {
    expect(reducer(currentState, { type: notesListActionTypes.ADD_AND_SELECT_NODE })).toBe(currentState);
  });

  it('should, on ADD_AND_SELECT_NODE, return state w/ new tree and editor content for added ITEM node', () => {
    let expectedDate = 40404;
    let newNodeKind = nodeTypes.ITEM;
    const uniqid = 'newly-created-node-uniqid';
    const currentTree = currentState.notesTree.tree;

    // ---> test case where parent key is ID of a FOLDER
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
      ...currentState.notesTree,
      tree: expectedNewTree,
      dateModified: expectedDate,
    };

    let expectedEditorContent = {
      ...initialState.editorContent,
      id: uniqid,
      title: newNode.title,
      dateCreated: expectedDate,
      dateModified: expectedDate,
      readOnly: false,
    };

    let expectedNewState = {
      ...currentState,
      notesTree: expectedNotesTree,
      editorContent: expectedEditorContent,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.ADD_AND_SELECT_NODE,
      payload: {
        newNode,
        parentKey,
        now: expectedDate,
      },
    })).toEqual(expectedNewState);

    // ---> test case where parentKey is empty string -- new node expected to be added at root
    parentKey = '';
    // Build the expected new tree
    expectedNewTree = JSON.parse(JSON.stringify(currentTree));
    expectedNewTree.push(newNode);

    expectedDate = 753753;
    expectedNotesTree = {
      ...currentState.notesTree,
      tree: expectedNewTree,
      dateModified: expectedDate,
    };

    expectedEditorContent = {
      ...initialState.editorContent,
      id: uniqid,
      title: newNode.title,
      dateCreated: expectedDate,
      dateModified: expectedDate,
      readOnly: false,
    };

    expectedNewState = {
      ...currentState,
      notesTree: expectedNotesTree,
      editorContent: expectedEditorContent,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.ADD_AND_SELECT_NODE,
      payload: {
        newNode,
        parentKey,
        now: expectedDate,
      },
    })).toEqual(expectedNewState);
  });

  it('should, on ADD_AND_SELECT_NODE, return new tree w/ added FOLDER node, but editor content is unchanged', () => {
    let expectedDate = 4004;
    const uniqid = 'newly-created-node-uniqid';
    const currentTree = currentState.notesTree.tree;
    // ---> test case where parent key is ID of a FOLDER
    let parentKey = currentTree[0].id;
    let newNodeKind = nodeTypes.FOLDER;
    // Mock the uuid implementation to return a predictable ID we can verify with the assertion.
    uuid.mockImplementation(() => uniqid);
    let expectedNewNode = createNode({ type: newNodeKind });
    uuid.mockClear();

    let expectedNewTree = JSON.parse(JSON.stringify(currentTree));
    expectedNewTree[0].children.push(expectedNewNode);
    expectedNewTree[0].expanded = true;
    let expectedNotesTree = {
      ...currentState.notesTree,
      tree: expectedNewTree,
      dateModified: expectedDate,
    };

    // Note: since we are adding a folder node, loaded content editor does not change
    let expectedNewState = {
      ...currentState,
      notesTree: expectedNotesTree,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.ADD_AND_SELECT_NODE,
      payload: {
        newNode: expectedNewNode,
        parentKey,
        now: expectedDate,
      },
    })).toEqual(expectedNewState);

    // ---> test case where parentKey is empty string -- new FOLDER node expected to be added to root folder
    parentKey = '';
    expectedDate = 897897;

    expectedNewTree = JSON.parse(JSON.stringify(currentTree));
    expectedNewTree.push(expectedNewNode);
    expectedNotesTree = {
      ...currentState.notesTree,
      tree: expectedNewTree,
      dateModified: expectedDate,
    };

    // Note: since we are adding a folder node, loaded content editor does not change
    expectedNewState = {
      ...currentState,
      notesTree: expectedNotesTree,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.ADD_AND_SELECT_NODE,
      payload: {
        newNode: expectedNewNode,
        parentKey,
        now: expectedDate,
      },
    })).toEqual(expectedNewState);
  });

  it('should, on ADD_AND_SELECT_NODE, return current state if parentKey is invalid', () => {
    let newNodeKind = nodeTypes.ITEM;
    const uniqid = 'newly-created-node-uniqid';

    // Mock the uuid implementation to return a predictable ID we can verify with the assertion.
    uuid.mockImplementation(() => uniqid);
    let newNode = createNode({ type: newNodeKind });
    uuid.mockClear();

    // ---> test case where parentKey is undefined
    let parentKey = undefined;

    expect(reducer(currentState, {
      type: notesListActionTypes.ADD_AND_SELECT_NODE,
      payload: {
        newNode,
        parentKey,
        now: 123456,
      },
    })).toBe(currentState);

    // ---> test case where parentKey is null
    parentKey = null;
    expect(reducer(currentState, {
      type: notesListActionTypes.ADD_AND_SELECT_NODE,
      payload: {
        newNode,
        parentKey,
        now: 24680,
      },
    })).toBe(currentState);

    // ---> test case where parentKey is not a string
    parentKey = 0;
    expect(reducer(currentState, {
      type: notesListActionTypes.ADD_AND_SELECT_NODE,
      payload: {
        newNode,
        parentKey,
        now: 369,
      },
    })).toBe(currentState);
  });
});
