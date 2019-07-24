const ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER;
import notesListActionTypes from './constants/notesListActionConstants';
import editorActionTypes from './constants/editorActionConstants';
import * as moduleToTest from './notesListActions';
import thunk from 'redux-thunk';
import setupMockStore from 'redux-mock-store';
import initialState from '../misc/initialState';
jest.mock('./editorActions');
import { newContentAction, fetchEditorContentThunkAction, removeNoteThunkAction } from './editorActions';
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

  it('when in non-Edit Mode, should 1) save content, 2) dispatch SELECT_NODE and 3) return Promise(action), when FOLDER node is selected', () => {
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
    let selectedFolderId = mockedTree[0].children[2].id;
    let mockedStore = mockStore(mockedState);
    let expectedActions = [
      {
        type: notesListActionTypes.SELECT_NODE,
        payload: {
          nodeId: selectedFolderId,
          path: [mockedTree[0].id, selectedFolderId],
        },
      },
    ];

    mockedSave.mockImplementation(() => Promise.resolve({}));

    // Note: since the active folder is not the root folder, the path provided is not the absolute path to the selected item;
    // instead, it is the path relative to the current active folder.
    expect(mockedStore.dispatch(moduleToTest.selectNodeThunkAction({ id: selectedFolderId, path: [selectedFolderId] }))).toMatchObject(expectedActions[0]);
    // expect content to be saved
    expect(mockedSave).lastCalledWith(mockedStore.getState().editorContent);
    expect(mockedStore.getActions()).toEqual(expectedActions);
    expect(fetchEditorContentThunkAction).not.toBeCalled();
    mockedStore.clearActions();

    // ---> test case: when active folder is root
    // Note: below we set the active node to an ITEM node located in root, so active folder is root.
    mockedState.activeNode = {
      id: mockedTree[1].id,
      path: [mockedTree[1].id],
    };
    mockedStore = mockStore(
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
    selectedFolderId = mockedTree[0].children[3].id;
    expectedActions = [
      {
        type: notesListActionTypes.SELECT_NODE,
        payload: {
          nodeId: selectedFolderId,
          path: [mockedTree[0].id, mockedTree[0].children[3].id],
        },
      },
    ];

    // Note: with root as the active folder, the path sent is the absolute path to the selected node
    expect(mockedStore.dispatch(moduleToTest.selectNodeThunkAction({ id: selectedFolderId, path: [mockedTree[0].id, mockedTree[0].children[3].id] }))).toMatchObject(expectedActions[0]);
    // expect content to be saved
    expect(mockedSave).lastCalledWith(mockedStore.getState().editorContent);
    expect(mockedStore.getActions()).toEqual(expectedActions);
    expect(fetchEditorContentThunkAction).not.toBeCalled();
  });

  it('when in non-Edit Mode, should 1) save content, 2) dispatch SELECT_NODE and FETCH_EDITOR_CONTENT_SUCCESS and 3) fetch content, when ITEM node selected', () => {
    const mockedState = {
      ...initialState,
      notesTree: {
        ...initialState.notesTree,
        tree: mockedTree,
      },
      activeNode: {
        id: NONE_SELECTED,
        path: [NONE_SELECTED],
      },
      editorContent: {
        ...initialState.editorContent,
        id: 111000222,
        dateModified: 4321,
        dateCreated: 1234,
      },
    };

    // we select an ITEM node from the mocked tree
    let selectedItem = mockedTree[0].children[1];
    // create a mocked store that returns a state based on type of the last action
    let mockedStore = mockStore(
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
    let expectedActions = [
      {
        type: notesListActionTypes.SELECT_NODE,
        payload: { nodeId: selectedItem.id, path: [mockedTree[0].id, selectedItem.id] },
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

    // Note: with root as the active folder, the path sent is the absolute path to the selected node
    expect(mockedStore.dispatch(moduleToTest.selectNodeThunkAction({ id: selectedItem.id, path: [mockedTree[0].id, selectedItem.id] }))).toMatchObject(expectedActions[0]);
    expect(mockedSave).lastCalledWith(mockedStore.getState().editorContent);
    expect(fetchEditorContentThunkAction).lastCalledWith({ noteId: selectedItem.uniqid });
    expect(mockedStore.getActions()).toEqual(expectedActions);
    mockedStore.clearActions();

    // ---> test case where active folder is not the root folder
    mockedState.activeNode = {
      id: mockedTree[0].children[2].children[0].id,
      path: [mockedTree[0].id, mockedTree[0].children[2].id, mockedTree[0].children[2].children[0].id],
    };

    // we select an ITEM node from the mocked tree
    selectedItem = mockedTree[0].children[2].children[1];
    mockedStore = mockStore(
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

    expectedActions = [
      {
        type: notesListActionTypes.SELECT_NODE,
        payload: { nodeId: selectedItem.id, path: [mockedTree[0].id, mockedTree[0].children[2].id, selectedItem.id] },
      },
      {
        type: editorActionTypes.FETCH_EDITOR_CONTENT_SUCCESS,
        payload: { editorContent: mockedContent },
      },
    ];


    // Note: since the active folder is not the root folder, the path provided is not the absolute path to the selected item;
    // instead, it is the path relative to the current active folder.
    expect(mockedStore.dispatch(moduleToTest.selectNodeThunkAction({ id: selectedItem.id, path: [selectedItem.id] }))).toMatchObject(expectedActions[0]);
    expect(mockedSave).lastCalledWith(mockedStore.getState().editorContent);
    expect(fetchEditorContentThunkAction).lastCalledWith({ noteId: selectedItem.uniqid });
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });

  it('when in non-Edit Mode, should *not* fetch if note selected is already loaded', () => {
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
    mockedSave.mockImplementation(() => Promise.resolve({}));
    fetchEditorContentThunkAction.mockImplementation(() => () => {});

    mockedStore.dispatch(moduleToTest.selectNodeThunkAction({ id: itemToSelect.id, path: [itemToSelect.id] }));
    expect(fetchEditorContentThunkAction).not.toBeCalled();
  });

  it('when in Edit Mode, dispatch EDIT_MODE_SELECT_NODE when node is selected', () => {
    let mockedState = {
      ...initialState,
      notesTree: {
        ...initialState.notesTree,
        editMode: true,
        editModeSelectedNodes: [],
        tree: mockedTree,
      },
      activeNode: {
        id: mockedTree[1].id,
        path: [mockedTree[1].id],
      },
      editorContent: {
        ...initialState.editorContent,
        id: 111000222,
        dateModified: 4321,
        dateCreated: 1234,
      },
    };

    // we select a node from the root folder
    let selectedItem = mockedTree[0];
    // create a mocked store that returns a state based on type of the last action
    let mockedStore = mockStore(mockedState);
    let expectedActions = [
      {
        type: notesListActionTypes.EDIT_MODE_SELECT_NODE,
        payload: { nodeId: selectedItem.id, path: [selectedItem.id] },
      },
    ];

    // Note: with root as the active folder, the path sent is the absolute path to the selected node
    mockedStore.dispatch(moduleToTest.selectNodeThunkAction({ id: selectedItem.id, path: [selectedItem.id] }));
    expect(mockedStore.getActions()).toEqual(expectedActions);
    expect(fetchEditorContentThunkAction).not.toBeCalled();
    expect(mockedSave).not.toBeCalled();
    mockedStore.clearActions();

    // ---> test case where active folder is NOT the root folder
    mockedState = {
      ...initialState,
      notesTree: {
        ...initialState.notesTree,
        editMode: true,
        editModeSelectedNodes: [],
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
    // we select a node from the active folder (which is not the root folder)
    selectedItem = mockedTree[0].children[2];
    // create a mocked store that returns a state based on type of the last action
    mockedStore = mockStore(mockedState);
    expectedActions = [
      {
        type: notesListActionTypes.EDIT_MODE_SELECT_NODE,
        payload: { nodeId: selectedItem.id, path: [mockedState.activeNode.id, selectedItem.id] },
      },
    ];

    // Note: since the active folder is not the root folder, the path provided is not the absolute path to the selected item;
    // instead, it is the path relative to the current active folder.
    mockedStore.dispatch(moduleToTest.selectNodeThunkAction({ id: selectedItem.id, path: [selectedItem.id] }));
    expect(mockedStore.getActions()).toEqual(expectedActions);
    expect(fetchEditorContentThunkAction).not.toBeCalled();
    expect(mockedSave).not.toBeCalled();
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

  it('should dispatch DELETE_NODE to delete nodes and SWITCH_NODE_ON_DELETE to switch active node, and call removeNoteThunkAction.', async() => {
    const expectedDate = 12345;
    global.Date = class extends RealDate {
      constructor() {
        super(expectedDate);
      }
      static now() {
        return expectedDate;
      }
    };

    // Choose a note (type=ITEM) in mockedTree[0] as active node; this means mockedTree[0] is the current folder.
    const selectedNodeId = mockedTree[0].children[1].id;
    const selectedNodeInfo = find({
      getNodeKey: treeUtils.getNodeKey,
      treeData: mockedTree,
      searchQuery: selectedNodeId,
      searchMethod: ({ node, searchQuery }) => node.id === searchQuery,
    }).matches[0];

    // list of checked nodes includes: 1) a note, 2) a folder containing children, and 3) an empty folder
    const checkedNodes = [selectedNodeInfo.node, mockedTree[0].children[2], mockedTree[0].children[3]];
    const mockedState = {
      ...initialState,
      notesTree: {
        ...initialState.notesTree,
        tree: mockedTree,
        editMode: true,
        editModeSelectedNodes: checkedNodes.map(node => node.id),
      },
      activeNode: {
        id: selectedNodeInfo.node.id,
        path: selectedNodeInfo.path,
      },
    };
    mockedStore = mockStore(mockedState);

    // list of uniqids of the notes (i.e. ITEM nodes) to be deleted, including child-ITEMs of folders.
    const uniqidsExpectedToBeDeleted = [checkedNodes[0].uniqid, ...checkedNodes[1].children.map(child => child.uniqid)];
    const expectedActions = [
      {
        type: notesListActionTypes.DELETE_NODE,
        payload: {
          now: expectedDate,
        },
      },
      {
        type: notesListActionTypes.SWITCH_NODE_ON_DELETE,
        payload: {
          deletedNodeIds: mockedState.notesTree.editModeSelectedNodes,
        },
      },
    ];

    removeNoteThunkAction.mockImplementation(() => () => Promise.resolve({
      type: editorActionTypes.REMOVE_NOTE_SUCCESS,
      payload: { ids: uniqidsExpectedToBeDeleted, count: uniqidsExpectedToBeDeleted.length },
    }));

    expect.assertions(3);

    await expect(mockedStore.dispatch(moduleToTest.deleteNodeThunkAction()))
      .resolves.toMatchObject(expectedActions[0]);
    expect(removeNoteThunkAction).lastCalledWith({ ids: uniqidsExpectedToBeDeleted });
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
    newContentAction.mockClear();
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

  it('should save current editor content, create new node, dispatch ADD_NODE, SELECT_NODE and NEW_EDITOR_CONTENT, if new node is ITEM', () => {
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

    const expectedNewEditorContent = {
      ...initialState.editorContent,
      id: newNode.uniqid,
      title: newNode.title,
      dateCreated: expectedDate,
      dateModified: expectedDate,
      readOnly: false,
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
      {
        type: editorActionTypes.NEW_EDITOR_CONTENT,
        payload: {
          newEditorContent: expectedNewEditorContent,
        },
      },
    ];

    mockedSave.mockImplementation(() => Promise.resolve('Saved'));
    newContentAction.mockImplementation(() => ({
      type: editorActionTypes.NEW_EDITOR_CONTENT,
      payload: {
        newEditorContent: expectedNewEditorContent,
      },
    }));
    const createNodeSpy = jest.spyOn(treeUtils, 'createNode');
    createNodeSpy.mockImplementation(() => newNode);

    expect(mockedStore.dispatch(moduleToTest.addAndSelectNodeThunkAction({ kind }))).toMatchObject(expectedAction[0]);
    expect(mockedSave).lastCalledWith(editorContent);
    expect(newContentAction).lastCalledWith({ editorContent: expectedNewEditorContent });
    expect(createNodeSpy).lastCalledWith({ type: kind });
    expect(mockedStore.getActions()).toEqual(expectedAction);
    mockedSave.mockClear();
    createNodeSpy.mockClear();
    newContentAction.mockClear();
    mockedStore.clearActions();

    // ---> Test case where active node is FOLDER in root
    activeNode = {
      id: mockedTree[2].id,
      path: [mockedTree[2].id],
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
          parentKey: activeNode.path[0],
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
      {
        type: editorActionTypes.NEW_EDITOR_CONTENT,
        payload: {
          newEditorContent: expectedNewEditorContent,
        },
      },
    ];

    expect(mockedStore.dispatch(moduleToTest.addAndSelectNodeThunkAction({ kind }))).toMatchObject(expectedAction[0]);
    expect(mockedSave).lastCalledWith(editorContent);
    expect(newContentAction).lastCalledWith({ editorContent: expectedNewEditorContent });
    expect(createNodeSpy).lastCalledWith({ type: kind });
    expect(mockedStore.getActions()).toEqual(expectedAction);
    mockedSave.mockClear();
    newContentAction.mockClear();
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
      {
        type: editorActionTypes.NEW_EDITOR_CONTENT,
        payload: {
          newEditorContent: expectedNewEditorContent,
        },
      },
    ];

    expect(mockedStore.dispatch(moduleToTest.addAndSelectNodeThunkAction({ kind }))).toMatchObject(expectedAction[0]);
    expect(mockedSave).lastCalledWith(editorContent);
    expect(newContentAction).lastCalledWith({ editorContent: expectedNewEditorContent });
    expect(createNodeSpy).lastCalledWith({ type: kind });
    expect(mockedStore.getActions()).toEqual(expectedAction);
    mockedSave.mockClear();
    newContentAction.mockClear();
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
      {
        type: editorActionTypes.NEW_EDITOR_CONTENT,
        payload: {
          newEditorContent: expectedNewEditorContent,
        },
      },
    ];

    expect(mockedStore.dispatch(moduleToTest.addAndSelectNodeThunkAction({ kind }))).toMatchObject(expectedAction[0]);
    expect(mockedSave).lastCalledWith(editorContent);
    expect(newContentAction).lastCalledWith({ editorContent: expectedNewEditorContent });
    expect(createNodeSpy).lastCalledWith({ type: kind });
    expect(mockedStore.getActions()).toEqual(expectedAction);
    mockedSave.mockClear();
    newContentAction.mockClear();
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
      editMode: false,
      editModeSelectedNodes: [],
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
      editMode: false,
      editModeSelectedNodes: [],
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
        expanded: true,
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
