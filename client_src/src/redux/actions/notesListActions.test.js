const ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER;
import notesListActionTypes from './constants/notesListActionConstants';
import editorActionTypes from './constants/editorActionConstants';
import * as moduleToTest from './notesListActions';
import thunk from 'redux-thunk';
import setupMockStore from 'redux-mock-store';
import initialState from '../misc/initialState';
jest.mock('./editorActions');
import { fetchEditorContentThunkAction, removeNoteThunkAction } from './editorActions';
import { mockedContent } from '../../test-utils/mocks/mockedEditorContent';
import { mockedTree } from '../../test-utils/mocks/mockedNotesTree';
import { find } from 'react-sortable-tree';
import * as treeUtils from '../../utils/treeUtils';
import { NONE_SELECTED, nodeTypes } from '../../utils/appCONSTANTS';

const mockStore = setupMockStore([thunk]);

/**
 * selectNodeThunkAction
 */
describe('1. selectNodeThunkAction ', () => {
  const RealAlert = global.alert;
  const mockedSave = jest.fn();

  beforeEach(() => {
    // inject mocked dependency
    moduleToTest.use({ editorContentStorage: { save: mockedSave } });
    // provide implementation for window.alert
    global.alert = (...param) => console.log(...param);
  });

  afterEach(() => {
    global.alert = RealAlert;
    fetchEditorContentThunkAction.mockClear();
    mockedSave.mockClear();
  });

  it('should 1) save content, 2) dispatch SELECT_NODE and 3) return Promise(action), when FOLDER node is selected', () => {
    const mockedState = {
      ...initialState,
      notesTree: {
        ...initialState.notesTree,
        tree: mockedTree,
      },
      activeNode: {
        id: mockedTree[0].id,
        path: [mockedTree[0].id],
      },
      editorContent: {
        ...initialState.editorContent,
        id: 123123123,
        dateModified: 4321,
        dateCreated: 1234,
      },
    };
    const selectedFolderId = mockedTree[0].id;
    let mockedStore = mockStore(mockedState);
    let expectedActions = [
      {
        type: notesListActionTypes.SELECT_NODE,
        payload: { nodeId: selectedFolderId, path: [selectedFolderId] },
      },
    ];

    mockedSave.mockImplementation(() => Promise.resolve({}));

    expect(mockedStore.dispatch(moduleToTest.selectNodeThunkAction({ id: selectedFolderId, path: [selectedFolderId] }))).toMatchObject(expectedActions[0]);
    // expect content to be saved
    expect(mockedSave).lastCalledWith(mockedStore.getState().editorContent);
    expect(mockedStore.getActions()).toEqual(expectedActions);
    expect(fetchEditorContentThunkAction).not.toBeCalled();
    mockedStore.clearActions();

    // Should work when path not provided; in this case SELECT_NODE's path is based on active node path.
    expectedActions = [
      {
        type: notesListActionTypes.SELECT_NODE,
        payload: { nodeId: selectedFolderId },
      },
    ];
    expect(mockedStore.dispatch(moduleToTest.selectNodeThunkAction({ id: selectedFolderId }))).toMatchObject(expectedActions[0]);
    // expect content to be saved
    expect(mockedSave).lastCalledWith(mockedStore.getState().editorContent);
    expect(mockedStore.getActions()).toEqual(expectedActions);
    expect(fetchEditorContentThunkAction).not.toBeCalled();
  });

  it('should 1) save content, 2) dispatch SELECT_NODE, 3) fetch content and 4) return Promise(action), when ITEM node is selected', () => {
    const mockedState = {
      ...initialState,
      notesTree: {
        ...initialState.notesTree,
        tree: mockedTree,
      },
      activeNode: {
        id: mockedTree[0].id,
        path: [mockedTree[0].id],
      },
      editorContent: {
        ...initialState.editorContent,
        id: 111000222,
        dateModified: 4321,
        dateCreated: 1234,
      },
    };
    const selectedItem = mockedTree[1];
    // create a mocked store that returns a state based on type of the last action
    const mockedStore = mockStore(
      actions => {
        const lastAction = actions.length ? actions[actions.length - 1] : { type: '' };
        switch (lastAction.type) {
          case notesListActionTypes.SELECT_NODE:
            return {
              ...mockedState,
              activeNode: {
                id: lastAction.payload.nodeId,
                path: lastAction.payload.path,
              },
            };
          default:
            return mockedState;
        }
      }
    );
    const expectedActions = [
      {
        type: notesListActionTypes.SELECT_NODE,
        payload: { nodeId: selectedItem.id, path: [selectedItem.id] },
      },
      {
        type: editorActionTypes.FETCH_EDITOR_CONTENT_SUCCESS,
        payload: { editorContent: mockedContent },
      },
    ];

    mockedSave.mockImplementation(() => Promise.resolve({}));
    fetchEditorContentThunkAction.mockImplementation(() => () => {
      mockedStore.dispatch(expectedActions[1]);
      return Promise.resolve(expectedActions[1]);
    });

    expect.assertions(4);
    expect(mockedStore.dispatch(moduleToTest.selectNodeThunkAction({ id: selectedItem.id, path: [selectedItem.id] }))).toMatchObject(expectedActions[0]);
    expect(mockedSave).lastCalledWith(mockedStore.getState().editorContent);
    expect(fetchEditorContentThunkAction).lastCalledWith({ noteId: selectedItem.uniqid });
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });

  it('should *not* fetch if note selected is already loaded', () => {
    // We select an ITEM node
    const itemToSelect = mockedTree[1];
    // To simulate note already loaded, create state with active node ID and editor content ID from the item selected in test
    const mockedState = {
      ...initialState,
      notesTree: {
        ...initialState.notesTree,
        tree: mockedTree,
      },
      activeNode: {
        id: itemToSelect.id,
        path: [itemToSelect.id],
      },
      editorContent: {
        ...initialState.editorContent,
        id: itemToSelect.uniqid,
        dateModified: 4321,
        dateCreated: 1234,
      },
    };
    const mockedStore = mockStore(mockedState);
    const expectedActions = [
      {
        type: notesListActionTypes.SELECT_NODE,
        payload: { nodeId: itemToSelect.id, path: [itemToSelect.id] },
      },
    ];

    mockedSave.mockImplementation(() => Promise.resolve({}));
    fetchEditorContentThunkAction.mockImplementation(() => () => {});

    expect.assertions(4);
    expect(mockedStore.dispatch(moduleToTest.selectNodeThunkAction({ id: itemToSelect.id, path: [itemToSelect.id] }))).toMatchObject(expectedActions[0]);
    expect(mockedSave).lastCalledWith(mockedStore.getState().editorContent);
    expect(mockedStore.getActions()).toEqual(expectedActions);
    expect(fetchEditorContentThunkAction).not.toBeCalled();
  });
});

/**
 * deleteNodeThunkAction
 */
describe('2. deleteNodeThunkAction ', () => {
  const RealDate = global.Date;
  let mockedStore = mockStore({});

  afterEach(() => {
    global.Date = RealDate;
    mockedStore.clearActions();
    removeNoteThunkAction.mockClear();
  });

  it('should dispatch actions to delete node and child nodes, and switch active node. Deleted node is a selected folder.', async() => {
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
    const selectedNodeInfo = find({
      getNodeKey: treeUtils.getNodeKey,
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

    // The folder node to delete is the selected one
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

  it('should dispatch actions to delete node and switch to new active node. Deleted node is a note.', async() => {
    const expectedDate = 67890;
    global.Date = class extends RealDate {
      constructor() {
        super(expectedDate);
      }
      static now() {
        return expectedDate;
      }
    };

    // Choose active node in mocked tree that is a note (type=ITEM)
    const selectedNodeId = mockedTree[1].id;
    const selectedNodeInfo = find({
      getNodeKey: treeUtils.getNodeKey,
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

    // The 'note' to delete is the selected node
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
      getNodeKey: treeUtils.getNodeKey,
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
  const RealDate = global.Date;
  let mockedStore = mockStore({});
  let mockedSave = jest.fn();

  beforeEach(() => {
    // inject mocked dependency
    moduleToTest.use({ editorContentStorage: { save: mockedSave } });
  });

  afterEach(() => {
    global.Date = RealDate;
    mockedStore.clearActions();
    mockedSave.mockClear();
  });

  it('should save current editor content, create new node and dispatch ADD_NODE, if new node is FOLDER', () => {
    const kind = nodeTypes.FOLDER;
    const uniqid = '99887766';
    const newNode = {
      title: 'new node title',
      subtitle: 'new node subtitle',
      type: kind,
      uniqid,
      id: `${kind}${ID_DELIMITER}${uniqid}`,
    };
    const editorContent = {
      ...initialState.editorContent,
      id: 345345345,
      title: 'test note',
      dateModified: 98765,
      dateCreated: 56789,
    };

    // ---> Test case where active folder is root
    let activeNode = {
      id: NONE_SELECTED,
      path: [NONE_SELECTED],
    };

    mockedStore = mockStore({
      ...initialState,
      activeNode,
      editorContent,
    });

    const expectedDate = 12345;
    global.Date = class extends RealDate {
      constructor() {
        super(expectedDate);
      }
      static now() {
        return expectedDate;
      }
    };
    let expectedAction = [
      {
        type: notesListActionTypes.ADD_NODE,
        payload: {
          newNode,
          parentKey: '',
          now: expectedDate,
        },
      },
    ];

    mockedSave.mockImplementation(() => Promise.resolve('Saved'));
    const createNodeSpy = jest.spyOn(treeUtils, 'createNode');
    createNodeSpy.mockImplementation(() => newNode);

    expect(mockedStore.dispatch(moduleToTest.addAndSelectNodeThunkAction({ kind }))).toMatchObject(expectedAction[0]);
    expect(mockedSave).lastCalledWith(editorContent);
    expect(createNodeSpy).lastCalledWith({ type: kind });
    expect(mockedStore.getActions()).toEqual(expectedAction);
    mockedSave.mockClear();
    createNodeSpy.mockClear();
    mockedStore.clearActions();

    // ---> Test case where active node is FOLDER
    activeNode = {
      id: mockedTree[0].children[3].id,
      path: [mockedTree[0].id, mockedTree[0].children[3].id],
    };

    mockedStore = mockStore({
      ...initialState,
      activeNode,
      editorContent,
    });

    expectedAction = [
      {
        type: notesListActionTypes.ADD_NODE,
        payload: {
          newNode,
          parentKey: activeNode.path[1],
          now: expectedDate,
        },
      },
    ];

    expect(mockedStore.dispatch(moduleToTest.addAndSelectNodeThunkAction({ kind }))).toMatchObject(expectedAction[0]);
    expect(mockedSave).lastCalledWith(editorContent);
    expect(createNodeSpy).lastCalledWith({ type: kind });
    expect(mockedStore.getActions()).toEqual(expectedAction);
    mockedSave.mockClear();
    createNodeSpy.mockClear();
    mockedStore.clearActions();

    // ---> Test case where active node is an ITEM
    activeNode = {
      id: mockedTree[0].children[2].children[1].id,
      path: [mockedTree[0].id, mockedTree[0].children[2].id, mockedTree[0].children[2].children[1].id],
    };

    mockedStore = mockStore({
      ...initialState,
      activeNode,
      editorContent,
    });

    expectedAction = [
      {
        type: notesListActionTypes.ADD_NODE,
        payload: {
          newNode,
          parentKey: activeNode.path[1],
          now: expectedDate,
        },
      },
    ];

    expect(mockedStore.dispatch(moduleToTest.addAndSelectNodeThunkAction({ kind }))).toMatchObject(expectedAction[0]);
    expect(mockedSave).lastCalledWith(editorContent);
    expect(createNodeSpy).lastCalledWith({ type: kind });
    expect(mockedStore.getActions()).toEqual(expectedAction);
    mockedSave.mockClear();
    createNodeSpy.mockClear();
    mockedStore.clearActions();

    // ---> Test case where active node is an ITEM in root
    activeNode = {
      id: mockedTree[1].id,
      path: [mockedTree[1].id],
    };

    mockedStore = mockStore({
      ...initialState,
      activeNode,
      editorContent,
    });

    expectedAction = [
      {
        type: notesListActionTypes.ADD_NODE,
        payload: {
          newNode,
          parentKey: '',
          now: expectedDate,
        },
      },
    ];

    expect(mockedStore.dispatch(moduleToTest.addAndSelectNodeThunkAction({ kind }))).toMatchObject(expectedAction[0]);
    expect(mockedSave).lastCalledWith(editorContent);
    expect(createNodeSpy).lastCalledWith({ type: kind });
    expect(mockedStore.getActions()).toEqual(expectedAction);
    mockedSave.mockClear();
    createNodeSpy.mockClear();
    mockedStore.clearActions();

    createNodeSpy.mockRestore();
  });

  it('should save current editor content, create new node, dispatch ADD_NODE, and SELECT_NODE and update editor content if new node is ITEM', () => {
    const kind = nodeTypes.ITEM;
    const uniqid = '11223344';
    const newNode = {
      title: 'new node title',
      subtitle: 'new node subtitle',
      type: kind,
      uniqid,
      id: `${kind}${ID_DELIMITER}${uniqid}`,
    };
    const editorContent = {
      ...initialState.editorContent,
      id: 345345345,
      title: 'test note',
      dateModified: 98765,
      dateCreated: 56789,
    };

    // ---> Test case where active folder is root
    let activeNode = {
      id: NONE_SELECTED,
      path: [NONE_SELECTED],
    };

    mockedStore = mockStore({
      ...initialState,
      activeNode,
      editorContent,
    });

    const expectedDate = 12345;
    global.Date = class extends RealDate {
      constructor() {
        super(expectedDate);
      }
      static now() {
        return expectedDate;
      }
    };
    let expectedAction = [
      {
        type: notesListActionTypes.ADD_NODE,
        payload: {
          newNode,
          parentKey: '',
          now: expectedDate,
        },
      },
      {
        type: notesListActionTypes.SELECT_NODE,
        payload: {
          nodeId: newNode.id,
          path: [newNode.id],
        },
      },
    ];

    mockedSave.mockImplementation(() => Promise.resolve('Saved'));
    const createNodeSpy = jest.spyOn(treeUtils, 'createNode');
    createNodeSpy.mockImplementation(() => newNode);

    expect(mockedStore.dispatch(moduleToTest.addAndSelectNodeThunkAction({ kind }))).toMatchObject(expectedAction[0]);
    expect(mockedSave).lastCalledWith(editorContent);
    expect(createNodeSpy).lastCalledWith({ type: kind });
    expect(mockedStore.getActions()).toEqual(expectedAction);
    mockedSave.mockClear();
    createNodeSpy.mockClear();
    mockedStore.clearActions();

    // ---> Test case where active node is FOLDER
    activeNode = {
      id: mockedTree[0].children[3].id,
      path: [mockedTree[0].id, mockedTree[0].children[3].id],
    };

    mockedStore = mockStore({
      ...initialState,
      activeNode,
      editorContent,
    });

    expectedAction = [
      {
        type: notesListActionTypes.ADD_NODE,
        payload: {
          newNode,
          parentKey: activeNode.path[1],
          now: expectedDate,
        },
      },
      {
        type: notesListActionTypes.SELECT_NODE,
        payload: {
          nodeId: newNode.id,
          path: [...activeNode.path, newNode.id],
        },
      },
    ];

    expect(mockedStore.dispatch(moduleToTest.addAndSelectNodeThunkAction({ kind }))).toMatchObject(expectedAction[0]);
    expect(mockedSave).lastCalledWith(editorContent);
    expect(createNodeSpy).lastCalledWith({ type: kind });
    expect(mockedStore.getActions()).toEqual(expectedAction);
    mockedSave.mockClear();
    createNodeSpy.mockClear();
    mockedStore.clearActions();

    // ---> Test case where active node is an ITEM
    activeNode = {
      id: mockedTree[0].children[2].children[1].id,
      path: [mockedTree[0].id, mockedTree[0].children[2].id, mockedTree[0].children[2].children[1].id],
    };

    mockedStore = mockStore({
      ...initialState,
      activeNode,
      editorContent,
    });

    expectedAction = [
      {
        type: notesListActionTypes.ADD_NODE,
        payload: {
          newNode,
          parentKey: activeNode.path[1],
          now: expectedDate,
        },
      },
      {
        type: notesListActionTypes.SELECT_NODE,
        payload: {
          nodeId: newNode.id,
          path: [...activeNode.path.slice(0, -1), newNode.id],
        },
      },
    ];

    expect(mockedStore.dispatch(moduleToTest.addAndSelectNodeThunkAction({ kind }))).toMatchObject(expectedAction[0]);
    expect(mockedSave).lastCalledWith(editorContent);
    expect(createNodeSpy).lastCalledWith({ type: kind });
    expect(mockedStore.getActions()).toEqual(expectedAction);
    mockedSave.mockClear();
    createNodeSpy.mockClear();
    mockedStore.clearActions();

    // ---> Test case where active node is an ITEM in root
    activeNode = {
      id: mockedTree[1].id,
      path: [mockedTree[1].id],
    };

    mockedStore = mockStore({
      ...initialState,
      activeNode,
      editorContent,
    });

    expectedAction = [
      {
        type: notesListActionTypes.ADD_NODE,
        payload: {
          newNode,
          parentKey: '',
          now: expectedDate,
        },
      },
      {
        type: notesListActionTypes.SELECT_NODE,
        payload: {
          nodeId: newNode.id,
          path: [newNode.id],
        },
      },
    ];

    expect(mockedStore.dispatch(moduleToTest.addAndSelectNodeThunkAction({ kind }))).toMatchObject(expectedAction[0]);
    expect(mockedSave).lastCalledWith(editorContent);
    expect(createNodeSpy).lastCalledWith({ type: kind });
    expect(mockedStore.getActions()).toEqual(expectedAction);
    mockedSave.mockClear();
    createNodeSpy.mockClear();
    mockedStore.clearActions();

    createNodeSpy.mockRestore();
  });
});

/**
 * fetchNotesTreeThunkAction
 */
describe('4. fetchNotesTreeThunkAction ', () => {
  const RealDate = global.Date;
  const mockedStore = mockStore({
    ...initialState,
    userInfo: {
      id: 'Just the ID of current user',
    },
    notesTree: {
      ...initialState.notesTree,
      id: 'id of tree',
      tree: [],
    },
  });

  let mockedLoad = jest.fn();
  let mockedSave = jest.fn();

  beforeEach(() => {
    // inject mocked dependency
    moduleToTest.use({ notesTreeStorage: { load: mockedLoad }, editorContentStorage: { save: mockedSave } });
  });

  afterEach(() => {
    global.Date = RealDate;
    mockedStore.clearActions();
    mockedLoad.mockClear();
    mockedSave.mockClear();
  });

  it('should dispatch FETCH action, CHANGE-TREE action, SELECT-NODE action and then return Promise w/ FETCH-SUCCESS action', async() => {
    const expectedUserId = mockedStore.getState().userInfo.id;
    const dateCreated = 1;
    const dateModified = 2;
    const treeId = 'ID of test tree';
    const ownerId = 'ID of test tree owner';
    const expectedFetchedTreeData = {
      id: treeId,
      tree: mockedTree,
      dateCreated,
      dateModified,
      ownerId,
    };
    const expectedActions = [
      {
        type: notesListActionTypes.FETCH_NOTES_TREE,
        payload: { userId: expectedUserId },
      },
      {
        type: notesListActionTypes.FETCH_NOTES_TREE_SUCCESS,
        payload: {
          notesTree: expectedFetchedTreeData,
        },
      },
      {
        type: notesListActionTypes.CHANGE_NOTES_TREE,
        payload: {
          notesTree: expectedFetchedTreeData,
        },
      },
      {
        type: notesListActionTypes.SELECT_NODE,
        payload: {
          nodeId: NONE_SELECTED,
          path: [NONE_SELECTED],
        },
      },
    ];

    mockedLoad.mockImplementation(() => Promise.resolve(expectedFetchedTreeData));
    mockedSave.mockImplementation(() => Promise.resolve(true));

    expect.assertions(4);
    await expect(mockedStore.dispatch(moduleToTest.fetchNotesTreeThunkAction()))
      .resolves.toMatchObject(expectedActions[1]);
    // current editor content should be saved
    expect(mockedSave).lastCalledWith(mockedStore.getState().editorContent);
    expect(mockedLoad).lastCalledWith({ userId: expectedUserId });
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });

  it('should 1) dispatch FETCH-FAILURE when fetch returns no tree, 2) use empty tree, 3) return FETCH-FAILURE in Promise', async() => {
    const expectedDate = 24680;
    global.Date = class extends RealDate {
      constructor() {
        super(expectedDate);
      }
      static now() {
        return expectedDate;
      }
    };
    const expectedDefaultTree = {
      id: expect.any(String),
      tree: [],
      dateCreated: expectedDate,
      dateModified: expectedDate,
    };
    const expectedUserId = mockedStore.getState().userInfo.id;
    const errorMsg = 'No tree';
    const expectedActions = [
      {
        type: notesListActionTypes.FETCH_NOTES_TREE,
        payload: { userId: expectedUserId },
      },
      {
        type: notesListActionTypes.FETCH_NOTES_TREE_FAILURE,
        payload: {
          // Note from Jest doc: .toEqual won't perform a deep equality check for two errors.
          // Only the message property of an Error is considered for equality.
          error: new Error(`No tree loaded. Error: "${errorMsg}" Using default tree.`),
        },
      },
      {
        type: notesListActionTypes.CHANGE_NOTES_TREE,
        payload: {
          notesTree: expectedDefaultTree,
        },
      },
      {
        type: notesListActionTypes.SELECT_NODE,
        payload: {
          nodeId: NONE_SELECTED,
          path: [NONE_SELECTED],
        },
      },
    ];

    mockedLoad.mockImplementation(() => Promise.reject(new Error(errorMsg)));
    mockedSave.mockImplementation(() => Promise.resolve(true));

    expect.assertions(4);
    await expect(mockedStore.dispatch(moduleToTest.fetchNotesTreeThunkAction()))
      .resolves.toMatchObject(expectedActions[1]);
    // current editor content should be saved
    expect(mockedSave).lastCalledWith(mockedStore.getState().editorContent);
    expect(mockedLoad).lastCalledWith({ userId: expectedUserId });
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });

  it('should 1) dispatch FETCH-FAILURE action when fetch returns unknown format, 2) use empty tree and 3) return last action', async() => {
    const expectedDate = 13579;
    global.Date = class extends RealDate {
      constructor() {
        super(expectedDate);
      }
      static now() {
        return expectedDate;
      }
    };
    const expectedDefaultTree = {
      id: expect.any(String),
      tree: [],
      dateCreated: expectedDate,
      dateModified: expectedDate,
    };
    const expectedUserId = mockedStore.getState().userInfo.id;
    const expectedActions = [
      {
        type: notesListActionTypes.FETCH_NOTES_TREE,
        payload: { userId: expectedUserId },
      },
      {
        type: notesListActionTypes.FETCH_NOTES_TREE_FAILURE,
        payload: {
          // Note from Jest doc: .toEqual won't perform a deep equality check for two errors.
          // Only the message property of an Error is considered for equality.
          error: new Error('No tree loaded. Error: "Unrecognized data fetched" Using default tree.'),
        },
      },
      {
        type: notesListActionTypes.CHANGE_NOTES_TREE,
        payload: {
          notesTree: expectedDefaultTree,
        },
      },
      {
        type: notesListActionTypes.SELECT_NODE,
        payload: {
          nodeId: NONE_SELECTED,
          path: [NONE_SELECTED],
        },
      },
    ];

    mockedLoad.mockImplementation(() => Promise.resolve({ tree: 'invalid format.' }));
    mockedSave.mockImplementation(() => Promise.resolve(true));

    expect.assertions(4);
    await expect(mockedStore.dispatch(moduleToTest.fetchNotesTreeThunkAction()))
      .resolves.toMatchObject(expectedActions[1]);
    // current editor content should be saved
    expect(mockedSave).lastCalledWith(mockedStore.getState().editorContent);
    expect(mockedLoad).lastCalledWith({ userId: expectedUserId });
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });
});

/**
 * navigatePathThunkAction
 */
describe('5. navigatePathThunkAction ', () => {
  let mockedStore = mockStore({});
  let mockedSave = jest.fn();

  beforeEach(() => {
    // inject mocked dependency
    moduleToTest.use({ editorContentStorage: { save: mockedSave } });
  });

  afterEach(() => {
    mockedStore.clearActions();
    mockedSave.mockClear();
  });

  it('should save opened note and dispatch NAVIGATE_PATH action', () => {
    // Select an active node
    const selectedNode = mockedTree[0].children[2].children[1];
    const selectedNodeInfo = find({
      getNodeKey: treeUtils.getNodeKey,
      treeData: mockedTree,
      searchQuery: selectedNode.id,
      searchMethod: ({ node, searchQuery }) => node.id === searchQuery,
    }).matches[0];
    // Create mocked store
    const mockedEditorContent = {
      ...initialState.editorContent,
      id: 'ID of opened note',
      dateModified: 111222,
      dateCreated: 444555,
    };
    mockedStore = mockStore({
      ...initialState,
      editorContent: mockedEditorContent,
      notesTree: {
        ...initialState.notesTree,
        tree: mockedTree,
      },
      activeNode: {
        id: selectedNodeInfo.node.id,
        path: selectedNodeInfo.path,
      },
    });
    // Select an arbitrary path index to navigate to
    const navPathIndex = 1;
    const expectedActions = [
      {
        type: notesListActionTypes.NAVIGATE_PATH,
        payload: {
          idx: navPathIndex,
        },

      },
    ];
    mockedSave.mockImplementation(() => Promise.resolve('save success'));

    expect(mockedStore.dispatch(moduleToTest.navigatePathThunkAction({ idx: navPathIndex }))).toMatchObject(expectedActions[0]);
    expect(mockedSave).lastCalledWith(mockedEditorContent);
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });
});

/**
 * changeNotesFolderThunkAction
 */
describe('6. changeNotesFolderThunkAction ', () => {
  const RealDate = global.Date;
  let mockedStore = mockStore({});
  let mockedSave = jest.fn();

  beforeEach(() => {
    // inject mocked dependency
    moduleToTest.use({ editorContentStorage: { save: mockedSave } });
  });

  afterEach(() => {
    global.Date = RealDate;
    mockedStore.clearActions();
    mockedSave.mockClear();
  });

  it('should save opened note and dispatch CHANGE_NOTES_TREE_FOLDER action to switch active folder', () => {
    const expectedDate = 778899;
    global.Date = class extends RealDate {
      constructor() {
        super(expectedDate);
      }
      static now() {
        return expectedDate;
      }
    };
    // new folder to change to
    const newFolder = [
      {
        title: 'new root-folder',
        subtitle: '',
        uniqid: '878787',
        type: nodeTypes.FOLDER,
        get id() {
          return `${this.type}${ID_DELIMITER}${this.uniqid}`;
        },
        expanded: false,
        children: [
          {
            title: 'new sub-note 1',
            subtitle: '',
            uniqid: '232323',
            type: nodeTypes.ITEM,
            get id() {
              return `${this.type}${ID_DELIMITER}${this.uniqid}`;
            },
          },
        ],
      },
    ];
    // Choose an active node
    const selectedNode = mockedTree[0].children[2].children[0];
    const selectedNodeInfo = find({
      getNodeKey: treeUtils.getNodeKey,
      treeData: mockedTree,
      searchQuery: selectedNode.id,
      searchMethod: ({ node, searchQuery }) => node.id === searchQuery,
    }).matches[0];
    // Create mocked store
    const mockedEditorContent = {
      ...initialState.editorContent,
      id: 'ID of opened note',
      dateModified: 990011,
      dateCreated: 110099,
    };
    mockedStore = mockStore({
      ...initialState,
      editorContent: mockedEditorContent,
      notesTree: {
        ...initialState.notesTree,
        tree: mockedTree,
      },
      activeNode: {
        id: selectedNode.id,
        path: selectedNodeInfo.path,
      },
    });
    const expectedActions = [
      {
        type: notesListActionTypes.CHANGE_NOTES_TREE_FOLDER,
        payload: {
          folder: newFolder,
          activePath: mockedStore.getState().activeNode.path,
          now: expectedDate,
        },
      },
    ];
    mockedSave.mockImplementation(() => Promise.resolve('save done'));

    expect(mockedStore.dispatch(moduleToTest.changeNotesFolderThunkAction({ folder: newFolder }))).toMatchObject(expectedActions[0]);
    expect(mockedSave).lastCalledWith(mockedEditorContent);
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });
});
