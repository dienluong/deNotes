import reducer from './reducedReducer';
import notesListActionTypes from '../actions/constants/notesListActionConstants';
import initialState from '../misc/initialState';
import uuid from 'uuid/v4';
jest.mock('uuid/v4');
import { createNode } from '../../utils/treeUtils';

describe('reducedReducer', () => {
  const RealDate = global.Date;

  afterEach(() => {
    global.Date = RealDate;
    uuid.mockClear();
  });

  it('should return the initial state by default', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should, on ADD_AND_SELECT_NODE, return a state w/ a new tree and a new active node corresponding to the newly added node', () => {
    const expectedDate = 4004;
    global.Date = class extends RealDate {
      constructor() {
        super(expectedDate);
      }
      static now() {
        return expectedDate;
      }
    };

    // Use the actual uuid implementation for now...
    uuid.mockImplementation(() => {
      return require.requireActual('uuid/v4')();
    });

    // Build our current tree
    const rootFolder = createNode({ title: 'test root', type: 'folder' });
    const children = [createNode({ title: 'test child 1', type: 'folder' }), createNode({ title: 'test child 2', type: 'folder' })];
    const grandChild = [createNode({ title: 'test grandchild 1', type: 'item' })];
    rootFolder.children = children;
    children[0].children = grandChild;
    const currentTree = [
      rootFolder,
    ];

    const notesTree = {
      id: 'current-tree',
      tree: currentTree,
      dateCreated: 11,
      dateModified: 22,
    };

    const activeNode = {
      id: currentTree[0].children[0].children[0].id,
      path: [currentTree[0].id, currentTree[0].children[0].id, currentTree[0].children[0].children[0].id],
    };

    const currentState = {
      ...initialState,
      notesTree,
      activeNode,
    };

    const newNodePath = [currentTree[0].id, currentTree[0].children[1].id];
    const newNodeKind = 'item';

    // Now we mock the uuid implementation to return a predictable ID we can verify with the assertion.
    uuid.mockImplementation(() => 'newly-created-node-uniqid');
    const expectedNewNode = createNode({ type: newNodeKind });

    const newTree = [
      {
        ...currentTree[0],
        children: [
          {
            ...currentTree[0].children[0],
          },
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
    const expectedNotesTree = {
      ...notesTree,
      tree: newTree,
      dateModified: expectedDate,
    };

    const expectedActiveNode = {
      id: expectedNewNode.id,
      path: [...newNodePath, expectedNewNode.id],
    };

    const expectedEditorContent = {
      ...initialState.editorContent,
      id: expectedNewNode.uniqid,
      title: expectedNewNode.title,
      dateCreated: expectedDate,
      dateModified: expectedDate,
      readOnly: false,
    };

    const expectedNewState = {
      ...currentState,
      notesTree: expectedNotesTree,
      activeNode: expectedActiveNode,
      editorContent: expectedEditorContent,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.ADD_AND_SELECT_NODE,
      payload: {
        path: newNodePath,
        kind: newNodeKind,
      },
    })).toEqual(expectedNewState);
  });
});
