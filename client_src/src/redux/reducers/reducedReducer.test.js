import reducer from './reducedReducer';
import notesListActionTypes from '../actions/constants/notesListActionConstants';
import initialState from '../misc/initialState';
import uuid from 'uuid/v4';
jest.mock('uuid/v4');
import { createNode } from '../../utils/treeUtils';
import { nodeTypes, NONE_SELECTED } from '../../utils/appCONSTANTS';

describe('reducedReducer', () => {
  // Use the actual uuid implementation for now...
  uuid.mockImplementation(() => {
    return require.requireActual('uuid/v4')();
  });
  const parentFolder = createNode({ title: 'test root', type: nodeTypes.FOLDER });
  const children = [createNode({ title: 'test child 1', type: nodeTypes.FOLDER }), createNode({ title: 'test child 2', type: nodeTypes.FOLDER })];
  const grandChild = [createNode({ title: 'test grandchild 1', type: nodeTypes.ITEM })];
  parentFolder.children = children;
  children[0].children = grandChild;
  const currentTree = [
    parentFolder,
  ];

  const notesTree = {
    id: 'current-tree-id',
    tree: currentTree,
    dateCreated: 11,
    dateModified: 22,
  };

  // no active node since the folder is empty
  const activeNode = {
    id: NONE_SELECTED,
    path: [currentTree[0].id, currentTree[0].children[1].id, NONE_SELECTED],
  };

  const currentState = {
    ...initialState,
    notesTree,
    activeNode,
  };

  afterEach(() => {
    uuid.mockClear();
  });

  it('should return the initial state by default', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should return current state if no payload', () => {
    expect(reducer(currentState, { type: notesListActionTypes.ADD_AND_SELECT_NODE })).toBe(currentState);
  });

  it('should, on ADD_AND_SELECT_NODE, return state w/ 1) new tree, 2) new active node and 3) editor content for newly added note', () => {
    const expectedDate = 4004;
    let newNodeKind = nodeTypes.ITEM;

    // Now we mock the uuid implementation to return a predictable ID we can verify with the assertion.
    uuid.mockImplementation(() => 'newly-created-node-uniqid');
    let expectedNewNode = createNode({ type: newNodeKind });
    let newTree = [
      {
        ...currentTree[0],
        children: [
          currentTree[0].children[0],
          {
            ...currentTree[0].children[1],
            expanded: true,
            children: [
              expectedNewNode,
            ],
          },
        ],
      },
    ];
    let expectedNotesTree = {
      ...notesTree,
      tree: newTree,
      dateModified: expectedDate,
    };

    let expectedActiveNode = {
      id: expectedNewNode.id,
      path: [...currentState.activeNode.path.slice(0, -1), expectedNewNode.id],
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
  });

  it('should, on ADD_AND_SELECT_NODE, add node to active folder but editor content is unchanged since added node is a folder', () => {
    const expectedDate = 4004;
    const modifiedCurrentState = {
      ...currentState,
      activeNode: {
        id: currentTree[0].id,
        path: [currentTree[0].id],
      },
    };
    let newNodeKind = nodeTypes.FOLDER;
    // We mock the uuid implementation to return a predictable ID we can verify with the assertion.
    uuid.mockImplementation(() => 'newly-created-node-uniqid');
    let expectedNewNode = createNode({ type: newNodeKind });
    let newTree = [
      ...modifiedCurrentState.notesTree.tree,
      expectedNewNode,
    ];
    let expectedNotesTree = {
      ...notesTree,
      tree: newTree,
      dateModified: expectedDate,
    };

    let expectedActiveNode = {
      id: NONE_SELECTED,
      path: [...modifiedCurrentState.activeNode.path.slice(0, -1), expectedNewNode.id, NONE_SELECTED],
    };

    // Note: since we are adding a folder node, loaded content editor does not change
    let expectedNewState = {
      ...modifiedCurrentState,
      notesTree: expectedNotesTree,
      activeNode: expectedActiveNode,
    };

    expect(reducer(modifiedCurrentState, {
      type: notesListActionTypes.ADD_AND_SELECT_NODE,
      payload: {
        kind: newNodeKind,
        now: expectedDate,
      },
    })).toEqual(expectedNewState);
  });
});
