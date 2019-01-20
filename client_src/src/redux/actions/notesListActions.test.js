const ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER;
import uuid from 'uuid/v4';
import notesListActionTypes from './constants/notesListActionConstants';
import editorActionTypes from './constants/editorActionConstants';
import * as moduleToTest from './notesListActions';
import thunk from 'redux-thunk';
import setupMockStore from 'redux-mock-store';
import initialState from '../misc/initialState';
// jest.mock('../../reactive/editorContentObserver');
// import { save } from '../../reactive/editorContentObserver';
// jest.mock('../../utils/notesTreeStorage');
// import { load as loadTree } from '../../utils/notesTreeStorage';
jest.mock('./editorActions');
import { fetchEditorContentThunkAction, removeNoteThunkAction } from './editorActions';
import { mockedContent } from '../../test-utils/mocks/mockedEditorContent';
import { mockedTree } from '../../test-utils/mocks/mockedNotesTree';
import { find } from 'react-sortable-tree';
import { getNodeKey } from '../../utils/treeUtils';

/**
 * selectNodeThunkAction
 */
describe('1. selectNodeThunkAction ', () => {
  const RealAlert = global.alert;
  const mockedStore = setupMockStore([thunk])({
    ...initialState,
    editorContent: {
      ...initialState.editorContent,
      id: uuid(),
      dateModified: Date.now(),
      dateCreated: Date.now(),
    },
  });

  let mockedSave = jest.fn();

  beforeEach(() => {
    // inject mocked dependency
    moduleToTest.use({ editorContentStorage: { save: mockedSave } });
    // provide implementation for window.alert
    global.alert = (...param) => console.log(...param);
  });

  afterEach(() => {
    global.alert = RealAlert;
    mockedStore.clearActions();
    fetchEditorContentThunkAction.mockClear();
    mockedSave.mockClear();
  });

  it('should 1) dispatch "select node", 2) save content, 3) return Promise w/ dispatched action, when Folder selected', () => {
    const id = 'folder' + ID_DELIMITER + uuid();
    const pathSeg1 = uuid();
    const pathSeg2 = uuid();
    const pathSeg3 = uuid();
    const path = [pathSeg1, pathSeg2, pathSeg3, id];
    const expectedActions = [
      {
        type: notesListActionTypes.SELECT_NODE,
        payload: {
          nodeId: id,
          path,
        },
      },
    ];
    mockedSave.mockImplementation(() => Promise.resolve({}));

    expect.assertions(3);
    expect(mockedStore.dispatch(moduleToTest.selectNodeThunkAction({ id, path }))).toMatchObject(expectedActions[0]);
    expect(mockedSave).lastCalledWith(mockedStore.getState().editorContent);
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });

  it('should 1) dispatch "select node", 2) save, 3) fetch, 4) return Promise w/ last action, when Item selected', () => {
    const uniqId = uuid();
    const id = 'item' + ID_DELIMITER + uniqId;
    const pathSeg1 = 'folder' + ID_DELIMITER + uuid();
    const pathSeg2 = 'folder' + ID_DELIMITER + uuid();
    const pathSeg3 = 'folder' + ID_DELIMITER + uuid();
    const path = [pathSeg1, pathSeg2, pathSeg3, id];
    const expectedActions = [
      {
        type: notesListActionTypes.SELECT_NODE,
        payload: {
          nodeId: id,
          path,
        },
      },
    ];
    const fetchAction = {
      type: editorActionTypes.FETCH_EDITOR_CONTENT_SUCCESS,
      payload: { editorContent: mockedContent },
    };

    fetchEditorContentThunkAction.mockImplementation(() => () => Promise.resolve(fetchAction));
    mockedSave.mockImplementation(() => Promise.resolve({}));

    expect.assertions(4);
    // selectNodeThunkAction is expected to return a Promise resolving to the last action, the fetch action in this case.
    expect(mockedStore.dispatch(moduleToTest.selectNodeThunkAction({ id, path }))).toMatchObject(expectedActions[0]);
    expect(mockedStore.getActions()).toEqual(expectedActions);
    expect(mockedSave).lastCalledWith(mockedStore.getState().editorContent);
    expect(fetchEditorContentThunkAction).lastCalledWith({ noteId: uniqId });
  });

  it('should *not* fetch if note selected was already loaded', () => {
    // select the note that's already loaded in the editor
    const uniqId = mockedStore.getState().editorContent.id;
    const id = 'item' + ID_DELIMITER + uniqId;
    const pathSeg1 = 'folder' + ID_DELIMITER + uuid();
    const pathSeg2 = 'folder' + ID_DELIMITER + uuid();
    const pathSeg3 = 'folder' + ID_DELIMITER + uuid();
    const path = [pathSeg1, pathSeg2, pathSeg3, id];
    const expectedActions = [
      {
        type: notesListActionTypes.SELECT_NODE,
        payload: {
          nodeId: id,
          path,
        },
      },
    ];

    fetchEditorContentThunkAction.mockImplementation(() => () => Promise.resolve({}));
    mockedSave.mockImplementation(() => Promise.resolve({}));

    expect.assertions(4);
    // selectNodeThunkAction is expected to return a Promise resolving to the last action, the fetch action in this case.
    expect(mockedStore.dispatch(moduleToTest.selectNodeThunkAction({ id, path }))).toMatchObject(expectedActions[0]);
    expect(mockedStore.getActions()).toEqual(expectedActions);
    expect(mockedSave).lastCalledWith(mockedStore.getState().editorContent);
    expect(fetchEditorContentThunkAction).not.toBeCalled();
  });

  it('should *not* dispatch any action if selected node did not change', () => {
    // select the node that is currently the active (i.e. selected) one
    const id = mockedStore.getState().activeNode.id;
    const pathSeg1 = uuid();
    const pathSeg2 = uuid();
    const pathSeg3 = uuid();
    const path = [pathSeg1, pathSeg2, pathSeg3, id];
    mockedSave.mockImplementation(() => Promise.resolve({}));

    expect.assertions(3);
    expect(mockedStore.dispatch(moduleToTest.selectNodeThunkAction({ id, path }))).toMatchObject({});
    expect(mockedSave).not.toBeCalled();
    expect(mockedStore.getActions()).toEqual([]);
  });
});

/**
 * deleteNodeThunkAction
 */
describe('2. deleteNodeThunkAction ', () => {
  const RealDate = global.Date;
  const mockStore = setupMockStore([thunk]);
  let mockedStore = mockStore({});

  afterEach(() => {
    global.Date = RealDate;
    mockedStore.clearActions();
    removeNoteThunkAction.mockClear();
    fetchEditorContentThunkAction.mockClear();
  });

  it('should dispatch actions to delete node and child nodes, and switch to new active node. Deleted node is folder.', async() => {
    const expectedDate = 12345;
    global.Date = class extends RealDate {
      constructor() {
        super(expectedDate);
      }
      static now() {
        return expectedDate;
      }
    };

    // Choose a folder node in mocked tree as active node
    const selectedNodeId = mockedTree[0].children[2].id;
    const siblings = mockedTree[0].children;
    const selectedNodeInfo = find({
      getNodeKey,
      treeData: mockedTree,
      searchQuery: selectedNodeId,
      searchMethod: ({ node, searchQuery }) => node.id === searchQuery,
    }).matches[0];
    mockedStore = mockStore({
      ...initialState,
      notesTree: {
        ...initialState.notesTree,
        tree: mockedTree,
      },
      activeNode: {
        id: selectedNodeInfo.node.id,
        path: selectedNodeInfo.path,
      },
    });

    // Choose a folder node to delete
    const nodeToDelete = selectedNodeInfo.node;
    const notesExpectedToBeDeleted = nodeToDelete.children.map(child => child.uniqid);
    const expectedActions = [
      {
        type: notesListActionTypes.DELETE_NODE,
        payload: {
          nodeToDelete,
          activePath: selectedNodeInfo.path,
          now: expectedDate,
        },
      },
      {
        type: notesListActionTypes.SWITCH_NODE_ON_DELETE,
        payload: {
          deletedNodeId: nodeToDelete.id,
          children: siblings,
        },
      },
    ];

    removeNoteThunkAction.mockImplementation(() => () => Promise.resolve({
      type: editorActionTypes.REMOVE_NOTE_SUCCESS,
      payload: { ids: notesExpectedToBeDeleted, count: notesExpectedToBeDeleted.length },
    }));

    expect.assertions(3);

    await expect(mockedStore.dispatch(moduleToTest.deleteNodeThunkAction({ node: nodeToDelete })))
      .resolves.toMatchObject(expectedActions[0]);
    expect(removeNoteThunkAction).lastCalledWith({ ids: notesExpectedToBeDeleted });
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });

  it('should dispatch actions to delete node, switch to new active node and load its content. Deleted node is a note.', async() => {
    const expectedDate = 67890;
    global.Date = class extends RealDate {
      constructor() {
        super(expectedDate);
      }
      static now() {
        return expectedDate;
      }
    };

    // Choose active node in mocked tree that is a note (type=item)
    const selectedNodeId = mockedTree[1].id;
    const siblings = mockedTree;
    const selectedNodeInfo = find({
      getNodeKey,
      treeData: mockedTree,
      searchQuery: selectedNodeId,
      searchMethod: ({ node, searchQuery }) => node.id === searchQuery,
    }).matches[0];
    // Create mocked store
    mockedStore = mockStore({
      ...initialState,
      notesTree: {
        ...initialState.notesTree,
        tree: mockedTree,
      },
      activeNode: {
        id: selectedNodeInfo.node.id,
        path: selectedNodeInfo.path,
      },
      editorContent: {
        id: 'id_of_editor_content',
      },
    });

    // Choose a 'note' node to delete
    const nodeToDelete = selectedNodeInfo.node;
    const notesExpectedToBeDeleted = [nodeToDelete.uniqid];
    const expectedActions = [
      {
        type: notesListActionTypes.DELETE_NODE,
        payload: {
          nodeToDelete,
          activePath: selectedNodeInfo.path,
          now: expectedDate,
        },
      },
      {
        type: notesListActionTypes.SWITCH_NODE_ON_DELETE,
        payload: {
          deletedNodeId: nodeToDelete.id,
          children: siblings,
        },
      },
    ];
    const noteToFetchUniqid = selectedNodeInfo.node.uniqid;

    removeNoteThunkAction.mockImplementation(() => () => Promise.resolve({
      type: editorActionTypes.REMOVE_NOTE_SUCCESS,
      payload: { ids: notesExpectedToBeDeleted, count: notesExpectedToBeDeleted.length },
    }));

    fetchEditorContentThunkAction.mockImplementation(() => () => Promise.resolve({
      type: editorActionTypes.FETCH_EDITOR_CONTENT_SUCCESS,
      payload: {},
    }));

    expect.assertions(4);

    await expect(mockedStore.dispatch(moduleToTest.deleteNodeThunkAction({ node: nodeToDelete })))
      .resolves.toMatchObject(expectedActions[0]);
    expect(removeNoteThunkAction).lastCalledWith({ ids: notesExpectedToBeDeleted });
    expect(fetchEditorContentThunkAction).lastCalledWith({ noteId: noteToFetchUniqid });
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });

  it('should dispatch actions to delete node (but no change to active node). Deleted node is an empty folder and not selected.', async() => {
    const expectedDate = 112233;
    global.Date = class extends RealDate {
      constructor() {
        super(expectedDate);
      }
      static now() {
        return expectedDate;
      }
    };

    // Choose an active node
    const selectedNodeId = mockedTree[1].id;
    const selectedNodeInfo = find({
      getNodeKey,
      treeData: mockedTree,
      searchQuery: selectedNodeId,
      searchMethod: ({ node, searchQuery }) => node.id === searchQuery,
    }).matches[0];
    const siblings = mockedTree;
    // Create mocked store
    mockedStore = mockStore({
      ...initialState,
      notesTree: {
        ...initialState.notesTree,
        tree: mockedTree,
      },
      activeNode: {
        id: selectedNodeInfo.node.id,
        path: selectedNodeInfo.path,
      },
      editorContent: {
        id: 'id_of_editor_content',
      },
    });

    // Node to delete is an empty folder
    const nodeToDelete = mockedTree[2];
    // No notes expected to be deleted
    const notesExpectedToBeDeleted = [];
    const expectedActions = [
      {
        type: notesListActionTypes.DELETE_NODE,
        payload: {
          nodeToDelete,
          activePath: selectedNodeInfo.path,
          now: expectedDate,
        },
      },
    ];

    removeNoteThunkAction.mockImplementation(() => () => Promise.resolve({
      type: editorActionTypes.REMOVE_NOTE_SUCCESS,
      payload: { ids: notesExpectedToBeDeleted, count: notesExpectedToBeDeleted.length },
    }));

    expect.assertions(3);

    await expect(mockedStore.dispatch(moduleToTest.deleteNodeThunkAction({ node: nodeToDelete })))
      .resolves.toMatchObject(expectedActions[0]);
    expect(removeNoteThunkAction).lastCalledWith({ ids: notesExpectedToBeDeleted });
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });
});

/**
 * addAndSelectNodeThunkAction
 */
describe('3. addAndSelectNodeThunkAction ', () => {
  const mockedStore = setupMockStore([thunk])({
    ...initialState,
    editorContent: {
      ...initialState.editorContent,
      id: uuid(),
      dateModified: Date.now(),
      dateCreated: Date.now(),
    },
  });

  let mockedSave = jest.fn();

  beforeEach(() => {
    // inject mocked dependency
    moduleToTest.use({ editorContentStorage: { save: mockedSave } });
  });

  afterEach(() => {
    mockedStore.clearActions();
    mockedSave.mockClear();
  });

  it('should save the current content before adding an item to the tree and switching to that item', () => {
    const kind = 'item';
    const path = ['1', '2', '3'];
    const expectedAction = [
      {
        type: notesListActionTypes.ADD_AND_SELECT_NODE,
        payload: { kind, path },
      },
    ];

    mockedSave.mockImplementation(() => Promise.resolve('Saved'));

    expect.assertions(3);
    expect(mockedStore.dispatch(moduleToTest.addAndSelectNodeThunkAction({ kind, path }))).toMatchObject(expectedAction[0]);
    expect(mockedSave).lastCalledWith(mockedStore.getState().editorContent);
    expect(mockedStore.getActions()).toEqual(expectedAction);
  });
});

/**
 * fetchNotesTreeThunkAction
 */
describe('4. fetchNotesTreeThunkAction ', () => {
  const mockedStore = setupMockStore([thunk])({
    ...initialState,
    userInfo: {
      id: 'test-user',
    },
    notesTree: {
      ...initialState.notesTree,
      id: uuid(),
      tree: [],
    },
  });

  let mockedLoad = jest.fn();

  beforeEach(() => {
    // inject mocked dependency
    moduleToTest.use({ notesTreeStorage: { load: mockedLoad } });
  });

  afterEach(() => {
    mockedStore.clearActions();
    mockedLoad.mockClear();
  });

  it('should dispatch SUCCESS-type action w/ fetched tree as payload, select a node in tree and then return Promise w/ FETCH SUCCESS action', async() => {
    const userId = mockedStore.getState().userInfo.id;
    const dateCreated = 1;
    const dateModified = 2;
    const treeId = uuid();
    const ownerId = uuid();
    const fetchedTreeData = {
      id: treeId,
      tree: mockedTree,
      dateCreated,
      dateModified,
      ownerId,
    };
    const expectedActions = [
      {
        type: notesListActionTypes.FETCH_NOTES_TREE,
        payload: { userId },
      },
      {
        type: notesListActionTypes.FETCH_NOTES_TREE_SUCCESS,
        payload: {
          notesTree: fetchedTreeData,
        },
      },
      {
        type: notesListActionTypes.CHANGE_NOTES_TREE,
        payload: {
          notesTree: fetchedTreeData,
        },
      },
      {
        type: notesListActionTypes.SELECT_NODE,
        payload: {
          activeNode: {
            id: mockedTree[0].id,
            path: [mockedTree[0].id],
          },
        },
      },
    ];

    mockedLoad.mockImplementation(() => Promise.resolve(fetchedTreeData));

    expect.assertions(3);
    await expect(mockedStore.dispatch(moduleToTest.fetchNotesTreeThunkAction()))
      .resolves.toMatchObject(expectedActions[1]);
    expect(mockedLoad).lastCalledWith({ userId });
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });

  it('should 1) dispatch FAILURE-type action when fetch returns no tree, 2) use default tree and 3) return Promise w/ last action', async() => {
    const userId = mockedStore.getState().userInfo.id;
    const expectedActions = [
      {
        type: notesListActionTypes.FETCH_NOTES_TREE,
        payload: { userId },
      },
      {
        type: notesListActionTypes.FETCH_NOTES_TREE_FAILURE,
        payload: {
          // Note from Jest doc: .toEqual won't perform a deep equality check for two errors.
          // Only the message property of an Error is considered for equality.
          error: new Error('No tree loaded. Error: No tree. Using default tree.'),
        },
      },
      {
        type: notesListActionTypes.CHANGE_NOTES_TREE,
        payload: {
          notesTree: {
            id: expect.any(String),
            tree: initialState.notesTree.tree,
            dateCreated: expect.any(Number),
            dateModified: expect.any(Number),
          },
        },
      },
      {
        type: notesListActionTypes.ADD_AND_SELECT_NODE,
        payload: {
          kind: 'item',
          path: [initialState.notesTree.tree[0].id],
        },
      },
    ];

    mockedLoad.mockImplementation(() => Promise.reject(new Error('No tree.')));

    expect.assertions(3);
    await expect(mockedStore.dispatch(moduleToTest.fetchNotesTreeThunkAction()))
      .resolves.toMatchObject(expectedActions[3]);
    expect(mockedLoad).lastCalledWith({ userId });
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });

  it('should 1) dispatch FAILURE-type action when fetch returns unknown format, 2) use default tree and 3) return Promise w/ last action', async() => {
    const userId = mockedStore.getState().userInfo.id;
    const expectedActions = [
      {
        type: notesListActionTypes.FETCH_NOTES_TREE,
        payload: { userId },
      },
      {
        type: notesListActionTypes.FETCH_NOTES_TREE_FAILURE,
        payload: {
          // Note from Jest doc: .toEqual won't perform a deep equality check for two errors.
          // Only the message property of an Error is considered for equality.
          error: new Error('No tree loaded. Error: Unrecognized data fetched. Using default tree.'),
        },
      },
      {
        type: notesListActionTypes.CHANGE_NOTES_TREE,
        payload: {
          notesTree: {
            id: expect.any(String),
            tree: initialState.notesTree.tree,
            dateCreated: expect.any(Number),
            dateModified: expect.any(Number),
          },
        },
      },
      {
        type: notesListActionTypes.ADD_AND_SELECT_NODE,
        payload: {
          kind: 'item',
          path: [initialState.notesTree.tree[0].id],
        },
      },
    ];

    mockedLoad.mockImplementation(() => Promise.resolve({ tree: 'invalid format.' }));
    expect.assertions(3);

    await expect(mockedStore.dispatch(moduleToTest.fetchNotesTreeThunkAction()))
      .resolves.toMatchObject(expectedActions[3]);
    expect(mockedLoad).lastCalledWith({ userId });
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });
});
