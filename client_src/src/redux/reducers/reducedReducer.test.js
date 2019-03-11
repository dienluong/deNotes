import reducer from './reducedReducer';
import notesListActionTypes from '../actions/constants/notesListActionConstants';
import initialState from '../misc/initialState';
import uuid from 'uuid/v4';
jest.mock('uuid/v4');
import { createNode } from '../../utils/treeUtils';
import { nodeTypes, NONE_SELECTED } from '../../utils/appCONSTANTS';
import { mockedTree } from '../../test-utils/mocks/mockedNotesTree';

describe('reducedReducer', () => {
  // Use the actual uuid implementation for now...
  // uuid.mockImplementation(() => {
  //   return require.requireActual('uuid/v4')();
  // });
  // const parentFolder = createNode({ title: 'test root', type: nodeTypes.FOLDER });
  // const children = [createNode({ title: 'test child 1', type: nodeTypes.FOLDER }), createNode({ title: 'test child 2', type: nodeTypes.FOLDER })];
  // const grandChild = [createNode({ title: 'test grandchild 1', type: nodeTypes.ITEM })];
  // parentFolder.children = children;
  // children[0].children = grandChild;
  // const currentTree = [
  //   parentFolder,
  // ];

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

  it('should, on ADD_AND_SELECT_NODE, return state w/ 1) new tree, 2) new active node and 3) editor content for added ITEM node', () => {
    let expectedDate = 4004;
    let newNodeKind = nodeTypes.ITEM;
    const currentTree = currentState.notesTree.tree;
    // Select folder as active node
    currentState.activeNode = {
      id: currentTree[0].children[3].id,
      path: [currentTree[0].id, currentTree[0].children[3].id],
    };

    // Mock the uuid implementation to return a predictable ID we can verify with the assertion.
    uuid.mockImplementation(() => 'newly-created-node-uniqid');
    let expectedNewNode = createNode({ type: newNodeKind });
    // Build expected new tree
    let expectedNewTree = JSON.parse(JSON.stringify(currentTree));
    expectedNewTree[0].children[3].children.push(expectedNewNode);
    expectedNewTree[0].children[3].expanded = true;

    let expectedNotesTree = {
      ...currentState.notesTree,
      tree: expectedNewTree,
      dateModified: expectedDate,
    };

    let expectedActiveNode = {
      id: expectedNewNode.id,
      path: [...currentState.activeNode.path, expectedNewNode.id],
    };

    let expectedEditorContent = {
      ...initialState.editorContent,
      id: expectedNewNode.uniqid,
      title: expectedNewNode.title,
      dateCreated: expectedDate,
      dateModified: expectedDate,
      readOnly: false,
    };

    let expectedNewState = {
      ...currentState,
      notesTree: expectedNotesTree,
      activeNode: expectedActiveNode,
      editorContent: expectedEditorContent,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.ADD_AND_SELECT_NODE,
      payload: {
        kind: newNodeKind,
        now: expectedDate,
      },
    })).toEqual(expectedNewState);

    // Should still work when active node is an ITEM
    currentState.activeNode = {
      id: currentTree[0].children[2].children[1].id,
      path: [currentTree[0].id, currentTree[0].children[2].id, currentTree[0].children[2].children[1].id],
    };

    uuid.mockImplementation(() => 'another-newly-created-node-uniqid');
    expectedNewNode = createNode({ type: newNodeKind });
    // Build the expected new tree
    expectedNewTree = JSON.parse(JSON.stringify(currentTree));
    expectedNewTree[0].children[2].children.push(expectedNewNode);
    expectedNewTree[0].children[2].expanded = true;

    expectedDate = 50607;
    expectedNotesTree = {
      ...currentState.notesTree,
      tree: expectedNewTree,
      dateModified: expectedDate,
    };

    expectedActiveNode = {
      id: expectedNewNode.id,
      path: [...currentState.activeNode.path.slice(0, -1), expectedNewNode.id],
    };

    expectedEditorContent = {
      ...initialState.editorContent,
      id: expectedNewNode.uniqid,
      title: expectedNewNode.title,
      dateCreated: expectedDate,
      dateModified: expectedDate,
      readOnly: false,
    };

    expectedNewState = {
      ...currentState,
      notesTree: expectedNotesTree,
      activeNode: expectedActiveNode,
      editorContent: expectedEditorContent,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.ADD_AND_SELECT_NODE,
      payload: {
        kind: newNodeKind,
        now: expectedDate,
      },
    })).toEqual(expectedNewState);

    // Should still work if active node is NONE_SELECTED (active folder is root)
    currentState.activeNode = {
      id: NONE_SELECTED,
      path: [NONE_SELECTED],
    };

    uuid.mockImplementation(() => 'yet-another-newly-created-node-uniqid');
    expectedNewNode = createNode({ type: newNodeKind });
    // Build the expected new tree
    expectedNewTree = JSON.parse(JSON.stringify(currentTree));
    expectedNewTree.push(expectedNewNode);

    expectedDate = 630630;
    expectedNotesTree = {
      ...currentState.notesTree,
      tree: expectedNewTree,
      dateModified: expectedDate,
    };

    expectedActiveNode = {
      id: expectedNewNode.id,
      path: [expectedNewNode.id],
    };

    expectedEditorContent = {
      ...initialState.editorContent,
      id: expectedNewNode.uniqid,
      title: expectedNewNode.title,
      dateCreated: expectedDate,
      dateModified: expectedDate,
      readOnly: false,
    };

    expectedNewState = {
      ...currentState,
      notesTree: expectedNotesTree,
      activeNode: expectedActiveNode,
      editorContent: expectedEditorContent,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.ADD_AND_SELECT_NODE,
      payload: {
        kind: newNodeKind,
        now: expectedDate,
      },
    })).toEqual(expectedNewState);
  });

  it('should, on ADD_AND_SELECT_NODE, return new tree w/ added FOLDER node and updated active node, but editor content is unchanged', () => {
    let expectedDate = 4004;
    const currentTree = currentState.notesTree.tree;
    // A folder as active node
    currentState.activeNode = {
      id: currentTree[0].id,
      path: [currentTree[0].id],
    };
    let newNodeKind = nodeTypes.FOLDER;
    // Mock the uuid implementation to return a predictable ID we can verify with the assertion.
    uuid.mockImplementation(() => 'newly-created-node-uniqid');
    let expectedNewNode = createNode({ type: newNodeKind });
    let expectedNewTree = JSON.parse(JSON.stringify(currentTree));
    expectedNewTree[0].children.push(expectedNewNode);
    expectedNewTree[0].expanded = true;
    let expectedNotesTree = {
      ...currentState.notesTree,
      tree: expectedNewTree,
      dateModified: expectedDate,
    };

    let expectedActiveNode = {
      id: expectedNewNode.id,
      path: [...currentState.activeNode.path, expectedNewNode.id],
    };

    // Note: since we are adding a folder node, loaded content editor does not change
    let expectedNewState = {
      ...currentState,
      notesTree: expectedNotesTree,
      activeNode: expectedActiveNode,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.ADD_AND_SELECT_NODE,
      payload: {
        kind: newNodeKind,
        now: expectedDate,
      },
    })).toEqual(expectedNewState);

    // Should still work if we're at the root folder (NONE_SELECTED is active node)
    expectedDate = 897897;
    // A folder as active node
    currentState.activeNode = {
      id: NONE_SELECTED,
      path: [NONE_SELECTED],
    };
    // Mock the uuid implementation to return a predictable ID we can verify with the assertion.
    uuid.mockImplementation(() => 'another-newly-created-node-uniqid');
    expectedNewNode = createNode({ type: newNodeKind });
    expectedNewTree = JSON.parse(JSON.stringify(currentTree));
    expectedNewTree.push(expectedNewNode);
    expectedNotesTree = {
      ...currentState.notesTree,
      tree: expectedNewTree,
      dateModified: expectedDate,
    };

    expectedActiveNode = {
      id: expectedNewNode.id,
      path: [expectedNewNode.id],
    };

    // Note: since we are adding a folder node, loaded content editor does not change
    expectedNewState = {
      ...currentState,
      notesTree: expectedNotesTree,
      activeNode: expectedActiveNode,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.ADD_AND_SELECT_NODE,
      payload: {
        kind: newNodeKind,
        now: expectedDate,
      },
    })).toEqual(expectedNewState);

  });
});
