const ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER;
import uuid from 'uuid/v4';
import notesListActionTypes from './constants/notesListActionConstants';
import editorActionTypes from './constants/editorActionConstants';
import * as moduleToTest from './notesListActions';
import thunk from 'redux-thunk';
import setupMockStore from 'redux-mock-store';
import initialState from '../misc/initialState';
jest.mock('../../reactive/editorContentObserver');
import { save } from '../../reactive/editorContentObserver';
jest.mock('./editorActions');
import { fetchEditorContentThunkAction, removeNoteThunkAction } from './editorActions';
import { mockedContent } from '../../test-utils/mocks/mockedEditorContent';
import { mockedTree } from '../../test-utils/mocks/mockedNotesTree';

/**
 * selectNodeThunkAction
 */
describe('1. selectNodeThunkAction', () => {
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

  beforeEach(() => {
    // provide implementation for window.alert
    global.alert = (...param) => console.log(...param);
  });

  afterEach(() => {
    global.alert = RealAlert;
    mockedStore.clearActions();
    fetchEditorContentThunkAction.mockClear();
    save.mockClear();
  });

  it('should 1) dispatch "select node", 2) save content, 3) return Promise w/ dispatched action, when Folder selected', async() => {
    const id = 'folder' + ID_DELIMITER + uuid();
    const pathSeg1 = uuid();
    const pathSeg2 = uuid();
    const pathSeg3 = uuid();
    const path = [pathSeg1, pathSeg2, pathSeg3, id];
    const expectedActions = [
      {
        type: notesListActionTypes.SELECT_NODE,
        payload: {
          activeNode: { id, path },
        },
      },
    ];
    save.mockImplementation(() => Promise.resolve({}));

    expect.assertions(3);
    await expect(mockedStore.dispatch(moduleToTest.selectNodeThunkAction({ id, path })))
      .resolves.toMatchObject(expectedActions[0]);
    expect(save).toBeCalledWith(mockedStore.getState().editorContent);
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });

  it('should 1) dispatch "select node", 2) save, 3) fetch, 4) return Promise w/ last action, when Item selected', async() => {
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
          activeNode: { id, path },
        },
      },
    ];
    const fetchAction = {
      type: editorActionTypes.FETCH_EDITOR_CONTENT_SUCCESS,
      payload: { editorContent: mockedContent },
    };

    fetchEditorContentThunkAction.mockImplementation(() => () => Promise.resolve(fetchAction));
    save.mockImplementation(() => Promise.resolve({}));

    expect.assertions(4);
    // selectNodeThunkAction is expected to return a Promise resolving to the last action, the fetch action in this case.
    await expect(mockedStore.dispatch(moduleToTest.selectNodeThunkAction({ id, path })))
      .resolves.toMatchObject(fetchAction);
    expect(mockedStore.getActions()).toEqual(expectedActions);
    expect(save).toBeCalledWith(mockedStore.getState().editorContent);
    expect(fetchEditorContentThunkAction).toBeCalledWith({ noteId: uniqId });
  });

  it('should *not* fetch if note selected was already loaded', async() => {
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
          activeNode: { id, path },
        },
      },
    ];

    fetchEditorContentThunkAction.mockImplementation(() => () => Promise.resolve({}));
    save.mockImplementation(() => Promise.resolve({}));

    expect.assertions(4);
    // selectNodeThunkAction is expected to return a Promise resolving to the last action, the fetch action in this case.
    await expect(mockedStore.dispatch(moduleToTest.selectNodeThunkAction({ id, path })))
      .resolves.toMatchObject(expectedActions[0]);
    expect(mockedStore.getActions()).toEqual(expectedActions);
    expect(save).toBeCalledWith(mockedStore.getState().editorContent);
    expect(fetchEditorContentThunkAction).not.toBeCalled();
  });

  it('should *not* dispatch any action if selected node did not change', async() => {
    // select the node that is currently the active (i.e. selected) one
    const id = mockedStore.getState().activeNode.id;
    const pathSeg1 = uuid();
    const pathSeg2 = uuid();
    const pathSeg3 = uuid();
    const path = [pathSeg1, pathSeg2, pathSeg3, id];
    save.mockImplementation(() => Promise.resolve({}));

    expect.assertions(3);
    await expect(mockedStore.dispatch(moduleToTest.selectNodeThunkAction({ id, path })))
      .resolves.toMatchObject({});
    expect(save).not.toBeCalled();
    expect(mockedStore.getActions()).toEqual([]);
  });
});

describe('2. deleteNodeThunkAction', () => {
  const mockedStore = setupMockStore([thunk])({
    ...initialState,
    notesTree: {
      ...initialState.notesTree,
      tree: mockedTree,
    },
  });

  afterEach(() => {
    mockedStore.clearActions();
    removeNoteThunkAction.mockClear();
  });

  it('should dispatch actions to delete node and switch to new active node. Deleting folder and its content.', async() => {
    const nodeToDelete = mockedTree[0].children[2];
    const pathToNode = ['1', '4'];
    const notesExpectedToBeDeleted = ['5', '6'];
    const expectedActions = [
      {
        type: notesListActionTypes.DELETE_NODE,
        payload: {
          node: nodeToDelete,
          path: pathToNode,
        },
      },
      {
        type: notesListActionTypes.SWITCH_NODE_ON_DELETE,
        payload: {
          deletedNode: {
            id: nodeToDelete.id,
            path: pathToNode,
          },
        },
      },
    ];

    removeNoteThunkAction.mockImplementation(() => () => Promise.resolve({
      type: editorActionTypes.REMOVE_NOTE_SUCCESS,
      payload: { ids: notesExpectedToBeDeleted, count: 2 },
    }));

    expect.assertions(3);

    await expect(mockedStore.dispatch(moduleToTest.deleteNodeThunkAction({ node: nodeToDelete, path: pathToNode })))
      .resolves.toMatchObject(expectedActions[1]);
    expect(removeNoteThunkAction).toBeCalledWith({ ids: notesExpectedToBeDeleted });
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });
});
