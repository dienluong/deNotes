const ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER;
import uuid from 'uuid/v4';
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
import { getNodeKey } from '../../utils/treeUtils';

const mockStore = setupMockStore([thunk]);
/**
 * selectNodeThunkAction
 */
describe('1. selectNodeThunkAction ', () => {
  const RealAlert = global.alert;
  const mockedStore = mockStore({
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

  it('should 1) save content, 2) switch folder, 3) select first children, 4) load content and 5) return Promise(action), when Folder selected', () => {
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
        id: uuid(),
        dateModified: Date.now(),
        dateCreated: Date.now(),
      },
    };
    const selectedFolderId = mockedTree[0].id;
    const selectedFolderChildren = mockedTree[0].children;
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
          case notesListActionTypes.SWITCH_NODE_ON_TREE_FOLDER_CHANGE:
            return {
              ...mockedState,
              activeNode: {
                id: selectedFolderChildren[0].id,
                path: [selectedFolderChildren[0].id],
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
        payload: { nodeId: '', path: [selectedFolderId, ''] },
      },
      {
        type: notesListActionTypes.SWITCH_NODE_ON_TREE_FOLDER_CHANGE,
        payload: { folder: selectedFolderChildren },
      },
      {
        type: editorActionTypes.FETCH_EDITOR_CONTENT_SUCCESS,
        payload: { editorContent: mockedContent },
      },
    ];

    mockedSave.mockImplementation(() => Promise.resolve({}));
    fetchEditorContentThunkAction.mockImplementation(() => () => {
      mockedStore.dispatch(expectedActions[2]);
      return Promise.resolve(expectedActions[2]);
    });

    expect.assertions(4);
    expect(mockedStore.dispatch(moduleToTest.selectNodeThunkAction({ id: selectedFolderId, path: [selectedFolderId] }))).toMatchObject(expectedActions[0]);
    // expect content to be saved
    expect(mockedSave).lastCalledWith(mockedStore.getState().editorContent);
    // expect loading content of the first child
    expect(fetchEditorContentThunkAction).lastCalledWith({ noteId: selectedFolderChildren[0].uniqid });
    expect(mockedStore.getActions()).toEqual(expectedActions);

    mockedStore.clearActions();
  });

  it('should 1) save content, 2) dispatch "select node", 3) fetch content and 4) return Promise(action), when Item selected', () => {
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
        id: uuid(),
        dateModified: Date.now(),
        dateCreated: Date.now(),
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

  it('should save the current content before adding an item to the tree and switching to that item', () => {
    const editorContent = {
      ...initialState.editorContent,
      id: uuid(),
      title: 'test note',
      dateModified: Date.now(),
      dateCreated: Date.now(),
    };
    mockedStore = mockStore({
      ...initialState,
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
    const kind = 'item';
    const expectedAction = [
      {
        type: notesListActionTypes.ADD_AND_SELECT_NODE,
        payload: {
          kind,
          now: expectedDate,
        },
      },
    ];

    mockedSave.mockImplementation(() => Promise.resolve('Saved'));

    expect.assertions(3);
    expect(mockedStore.dispatch(moduleToTest.addAndSelectNodeThunkAction({ kind }))).toMatchObject(expectedAction[0]);
    expect(mockedSave).lastCalledWith(editorContent);
    expect(mockedStore.getActions()).toEqual(expectedAction);
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

  beforeEach(() => {
    // inject mocked dependency
    moduleToTest.use({ notesTreeStorage: { load: mockedLoad } });
  });

  afterEach(() => {
    global.Date = RealDate;
    mockedStore.clearActions();
    mockedLoad.mockClear();
  });

  it('should dispatch FETCH action, CHANGE-TREE action, SELECT-NODE action and then return Promise w/ FETCH-SUCCESS action', async() => {
    const expectedUserId = mockedStore.getState().userInfo.id;
    const dateCreated = 1;
    const dateModified = 2;
    const treeId = 'ID of test tree';
    const ownerId = 'ID of test tree owner';
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
        payload: { userId: expectedUserId },
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
          nodeId: mockedTree[0].id,
          path: [mockedTree[0].id],
        },
      },
    ];

    mockedLoad.mockImplementation(() => Promise.resolve(fetchedTreeData));

    expect.assertions(3);
    await expect(mockedStore.dispatch(moduleToTest.fetchNotesTreeThunkAction()))
      .resolves.toMatchObject(expectedActions[1]);
    expect(mockedLoad).lastCalledWith({ userId: expectedUserId });
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });

  it('should 1) dispatch FETCH-FAILURE action when fetch returns no tree, 2) use empty tree, 3) return last action', async() => {
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
          nodeId: '',
          path: [''],
        },
      },
      {
        type: notesListActionTypes.ADD_AND_SELECT_NODE,
        payload: {
          kind: 'item',
          now: expectedDate,
        },
      },
    ];

    mockedLoad.mockImplementation(() => Promise.reject(new Error(errorMsg)));

    expect.assertions(3);
    await expect(mockedStore.dispatch(moduleToTest.fetchNotesTreeThunkAction()))
      .resolves.toMatchObject(expectedActions[expectedActions.length - 1]);
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
          nodeId: '',
          path: [''],
        },
      },
      {
        type: notesListActionTypes.ADD_AND_SELECT_NODE,
        payload: {
          kind: 'item',
          now: expectedDate,
        },
      },
    ];

    mockedLoad.mockImplementation(() => Promise.resolve({ tree: 'invalid format.' }));
    expect.assertions(3);

    await expect(mockedStore.dispatch(moduleToTest.fetchNotesTreeThunkAction()))
      .resolves.toMatchObject(expectedActions[expectedActions.length - 1]);
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
    fetchEditorContentThunkAction.mockClear();
  });

  it('should save opened note, navigate to folder, select first node of folder and load content', () => {
    // Select an active node
    const selectedNode = mockedTree[0].children[2].children[1];
    const selectedNodeInfo = find({
      getNodeKey,
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
    const siblings = mockedTree[0].children[2].children;
    // Select an arbitrary path index to navigate to
    const navPathIndex = 1;
    const expectedActions = [
      {
        type: notesListActionTypes.NAVIGATE_PATH,
        payload: {
          idx: navPathIndex,
        },

      },
      {
        type: notesListActionTypes.SWITCH_NODE_ON_TREE_FOLDER_CHANGE,
        payload: {
          folder: siblings,
        },
      },
    ];
    mockedSave.mockImplementation(() => Promise.resolve('save success'));
    fetchEditorContentThunkAction.mockImplementation(() => () => Promise.resolve('fetch success'));

    expect(mockedStore.dispatch(moduleToTest.navigatePathThunkAction({ idx: navPathIndex }))).toMatchObject(expectedActions[0]);
    expect(mockedSave).lastCalledWith(mockedEditorContent);
    expect(fetchEditorContentThunkAction).lastCalledWith({ noteId: selectedNode.uniqid });
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
    fetchEditorContentThunkAction.mockClear();
  });

  it('should save opened note, dispatch action to modify folder and select node, then load content', () => {
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
        uniqid: '9999',
        type: 'folder',
        get id() {
          return `${this.type}${ID_DELIMITER}${this.uniqid}`;
        },
        expanded: false,
        children: [
          {
            title: 'new sub-note 1',
            subtitle: '',
            uniqid: '10101010',
            type: 'item',
            get id() {
              return `${this.type}${ID_DELIMITER}${this.uniqid}`;
            },
          },
        ],
      },
    ];
    // Choose an active node
    const selectedNode = mockedTree[1];
    const selectedNodeInfo = find({
      getNodeKey,
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
        id: selectedNodeInfo.node.id,
        path: selectedNodeInfo.path,
      },
    });
    const expectedActions = [
      {
        type: notesListActionTypes.CHANGE_NOTES_TREE_FOLDER,
        payload: {
          folder: newFolder,
          activePath: selectedNodeInfo.path,
          now: expectedDate,
        },
      },
      {
        type: notesListActionTypes.SWITCH_NODE_ON_TREE_FOLDER_CHANGE,
        payload: {
          folder: newFolder,
        },
      },
    ];
    mockedSave.mockImplementation(() => Promise.resolve('save done'));
    fetchEditorContentThunkAction.mockImplementation(() => () => Promise.resolve('fetch done'));

    expect(mockedStore.dispatch(moduleToTest.changeNotesFolderThunkAction({ folder: newFolder }))).toMatchObject(expectedActions[0]);
    expect(mockedSave).lastCalledWith(mockedEditorContent);
    expect(fetchEditorContentThunkAction).lastCalledWith({ noteId: selectedNode.uniqid });
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });
});
