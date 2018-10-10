const ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER;
import uuid from 'uuid/v4';
import notesListActionTypes from './constants/notesListActionConstants';
import editorActionTypes from './constants/editorActionConstants';
import { selectNodeThunkAction } from './notesListActions';
import thunk from 'redux-thunk';
import setupMockStore from 'redux-mock-store';
import initialState from '../misc/initialState';
jest.mock('../../reactive/editorContentObserver');
import { save } from '../../reactive/editorContentObserver';
jest.mock('./editorActions');
import { fetchEditorContentThunkAction } from './editorActions';
// jest.mock('../../utils/editorContentStorage');
// import { load } from '../../utils/editorContentStorage';
import { mockedContent } from '../../test-utils/mocks/mockedEditorContent';

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
    await expect(mockedStore.dispatch(selectNodeThunkAction({ id, path })))
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
    await expect(mockedStore.dispatch(selectNodeThunkAction({ id, path })))
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
    await expect(mockedStore.dispatch(selectNodeThunkAction({ id, path })))
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
    await expect(mockedStore.dispatch(selectNodeThunkAction({ id, path })))
      .resolves.toMatchObject({});
    expect(save).not.toBeCalled();
    expect(mockedStore.getActions()).toEqual([]);
  });
});
