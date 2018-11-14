import initialState from '../misc/initialState';
import Delta from 'quill-delta';
import uuid from 'uuid/v4';
import thunk from 'redux-thunk';
import setupMockStore from 'redux-mock-store';
import editorActionTypes from './constants/editorActionConstants';
import * as moduleToTest from './editorActions';
// jest.mock('../../utils/editorContentStorage');
// import { load, remove } from '../../utils/editorContentStorage';
import { mockedContent } from '../../test-utils/mocks/mockedEditorContent';

/**
 * changeContentAction
 */
describe('1. changeContentAction action creator', () => {
  const RealDate = global.Date;

  afterEach(() => {
    global.Date = RealDate;
  });

  it('should return an object with expected content, delta and date in payload, and with the proper action type', () => {
    const delta = new Delta();
    const content = '<p>123<br></p>';
    const expectedDate = RealDate.now();
    global.Date = class extends RealDate {
      constructor() {
        super(expectedDate);
      }

      static now() {
        return expectedDate;
      }
    };

    const getContents = jest.fn();
    getContents.mockReturnValue(delta);

    const returned = moduleToTest.changeContentAction({ editor: { getContents }, content });
    expect(returned).toMatchObject({
      type: editorActionTypes.CONTENT_CHANGED,
      payload: { newContent: { delta, content } },
    });
    expect(returned.payload.newContent.dateModified).toEqual(expectedDate);
  });
});

/**
 * fetchEditorContentThunkAction
 */
describe('2. fetchEditorContentThunkAction action creator', () => {
  const mockedStore = setupMockStore([thunk])(initialState);
  let mockedLoad = jest.fn();

  beforeEach(() => {
    moduleToTest.use({ editorContentStorage: { load: mockedLoad } });
  });
  afterEach(() => {
    mockedStore.clearActions();
    mockedLoad.mockClear();
  });

  it('should return a rejected Promise and dispatch a FAILURE-type action if no storage has been setup', async() => {
    const noteId = uuid();
    const expectedErrorMsg = /no storage implementation/i;
    const expectedActions = [
      {
        type: editorActionTypes.FETCH_EDITOR_CONTENT,
        payload: { id: noteId },
      },
      {
        type: editorActionTypes.FETCH_EDITOR_CONTENT_FAILURE,
        payload: {
          error: {
            message: expect.stringMatching(expectedErrorMsg),
            id: noteId,
          },
        },
      },
    ];

    // mock the load function, which is expected to be called by the tested function, to return the rejected Promise
    mockedLoad.mockImplementation(() => Promise.reject(new Error('Load aborted. Cause: No Storage implementation provided.')));

    expect.assertions(3);
    await expect(mockedStore.dispatch(moduleToTest.fetchEditorContentThunkAction({ noteId })))
      .rejects.toMatchObject({ message: expect.stringMatching(expectedErrorMsg) });
    expect(mockedLoad).toHaveBeenCalledWith({ id: noteId, userId: initialState.userInfo.id });
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });

  it('should dispatch the SUCCESS-type action and return a Promise resolving to dispatched action, with fetched content as payload', async() => {
    const noteId = uuid();
    const expectedActions = [
      {
        type: editorActionTypes.FETCH_EDITOR_CONTENT,
        payload: { id: noteId },
      },
      {
        type: editorActionTypes.FETCH_EDITOR_CONTENT_SUCCESS,
        payload: {
          editorContent: { ...mockedContent, readOnly: false },
        },
      },
    ];

    mockedLoad.mockImplementation(() => Promise.resolve(mockedContent));

    expect.assertions(3);
    await expect(mockedStore.dispatch(moduleToTest.fetchEditorContentThunkAction({ noteId })))
      .resolves.toMatchObject(expectedActions[1]);
    expect(mockedLoad).toHaveBeenCalledWith({ id: noteId, userId: initialState.userInfo.id });
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });
});




/**
 * removeNoteThunkAction
 */
describe('3. removeNoteThunkAction action creator', () => {
  const mockedStore = setupMockStore([thunk])(initialState);
  let mockedRemove = jest.fn();

  beforeEach(() => {
    moduleToTest.use({ editorContentStorage: { remove: mockedRemove } });
  });

  afterEach(() => {
    mockedStore.clearActions();
    mockedRemove.mockClear();
  });

  it('should dispatch SUCCESS-type action and return a Promise resolving to dispatched action', async() => {
    // deleting multiple notes
    const ids = [uuid(), uuid(), uuid()];
    const expectedActions = [
      {
        type: editorActionTypes.REMOVING_NOTE,
        payload: { ids },
      },
      {
        type: editorActionTypes.REMOVE_NOTE_SUCCESS,
        payload: { ids, count: ids.length },
      },
    ];

    mockedRemove.mockImplementation(() => Promise.resolve({ count: ids.length }));

    expect.assertions(3);
    await expect(mockedStore.dispatch(moduleToTest.removeNoteThunkAction({ ids })))
      .resolves.toMatchObject(expectedActions[1]);
    expect(mockedRemove).toHaveBeenCalledWith({ ids, userId: initialState.userInfo.id });
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });

  it('should dispatch SUCCESS-type action and return a Promise resolving to dispatched action, w/ empty ID list', async() => {
    const ids = [];
    const expectedActions = [
      {
        type: editorActionTypes.REMOVE_NOTE_SUCCESS,
        payload: { ids, count: ids.length },
      },
    ];

    mockedRemove.mockImplementation(() => Promise.resolve({ count: ids.length }));

    expect.assertions(3);
    await expect(mockedStore.dispatch(moduleToTest.removeNoteThunkAction({ ids })))
      .resolves.toMatchObject(expectedActions[0]);
    expect(mockedRemove).not.toHaveBeenCalled();
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });

  it('should dispatch FAILURE-type action and return a rejected Promise containing an Error', async() => {
    // deleting multiple notes
    const ids = [uuid(), uuid(), uuid()];
    const expectedErrorMsg = /error/i;
    const expectedActions = [
      {
        type: editorActionTypes.REMOVING_NOTE,
        payload: { ids },
      },
      {
        type: editorActionTypes.REMOVE_NOTE_FAILURE,
        payload: {
          error: {
            ids,
            message: expect.stringMatching(expectedErrorMsg),
          },
        },
      },
    ];

    mockedRemove.mockImplementation(() => Promise.reject(new Error('Error removing')));

    expect.assertions(3);
    await expect(mockedStore.dispatch(moduleToTest.removeNoteThunkAction({ ids })))
      .rejects.toMatchObject({ message: expect.stringMatching(expectedErrorMsg) });
    expect(mockedRemove).toHaveBeenCalledWith({ ids, userId: initialState.userInfo.id });
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });

  it('should return a rejected Promise for invalid argument', async() => {
    const ids = uuid();
    const expectedErrorMsg = /invalid parameter/i;
    const expectedActions = [
      {
        type: editorActionTypes.REMOVE_NOTE_FAILURE,
        payload: {
          error: {
            ids,
            message: expect.stringMatching(expectedErrorMsg),
          },
        },
      },
    ];

    expect.assertions(3);
    await expect(mockedStore.dispatch(moduleToTest.removeNoteThunkAction({ ids })))
      .rejects.toMatchObject({ message: expect.stringMatching(expectedErrorMsg) });
    expect(mockedRemove).not.toHaveBeenCalled();
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });
});
