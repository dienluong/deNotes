import initialState from '../misc/initialState';
import Delta from 'quill-delta';
import uuid from 'uuid/v4';
import thunk from 'redux-thunk';
import setupMockStore from 'redux-mock-store';
import editorActionTypes from './constants/editorActionConstants';
import { changeContentAction, fetchEditorContentThunkAction, removeNoteThunkAction } from './editorActions';
jest.mock('../../utils/editorContentStorage');
import { load, remove } from '../../utils/editorContentStorage';


describe('changeContentAction action creator', () => {
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

    const returned = changeContentAction({ editor: { getContents }, content });
    expect(returned).toMatchObject({
      type: editorActionTypes.CONTENT_CHANGED,
      payload: { newContent: { delta, content } },
    });
    expect(returned.payload.newContent.dateModified).toEqual(expectedDate);
  });
});


describe('fetchEditorContentThunkAction action creator', () => {
  const mockedStore = setupMockStore([thunk])(initialState);

  afterEach(() => {
    mockedStore.clearActions();
    load.mockClear();
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

    expect.assertions(3);

    // mock the load function, which is expected to be called by the tested function, to return the rejected Promise
    load.mockImplementation(() => Promise.reject(new Error('Load aborted. Cause: No Storage implementation provided.')));
    await expect(mockedStore.dispatch(fetchEditorContentThunkAction({ noteId })))
      .rejects.toMatchObject({ message: expect.stringMatching(expectedErrorMsg) });
    expect(load).toHaveBeenCalledWith({ id: noteId, userId: initialState.userInfo.id });
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });

  it('should dispatch the SUCCESS-type action and return a Promise resolving to dispatched action, with fetched content as payload', async() => {
    const noteId = uuid();
    const mockedContent = {
      id: noteId,
      title: 'Test title',
      content: '<p>Hellow World!<br></p>',
      delta: { ops: [{ insert: 'Hello' }, { insert: ' World!\n' }] },
      dateCreated: Date.now(),
      dateModified: Date.now() + 1,
    };
    load.mockImplementation(() => Promise.resolve(mockedContent));
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

    expect.assertions(3);
    await expect(mockedStore.dispatch(fetchEditorContentThunkAction({ noteId })))
      .resolves.toMatchObject({ ...expectedActions[1] });
    expect(load).toHaveBeenCalledWith({ id: noteId, userId: initialState.userInfo.id });
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });
});

describe('removeNoteThunkAction action creator', () => {
  const mockedStore = setupMockStore([thunk])(initialState);

  afterEach(() => {
    mockedStore.clearActions();
    remove.mockClear();
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

    expect.assertions(3);

    remove.mockImplementation(() => Promise.resolve({ count: ids.length }));
    await expect(mockedStore.dispatch(removeNoteThunkAction({ ids })))
      .resolves.toMatchObject({ ...expectedActions[1] });
    expect(remove).toHaveBeenCalledWith({ ids, userId: initialState.userInfo.id });
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

    expect.assertions(3);

    remove.mockImplementation(() => Promise.resolve({ count: ids.length }));
    await expect(mockedStore.dispatch(removeNoteThunkAction({ ids })))
      .resolves.toMatchObject({ ...expectedActions[0] });
    expect(remove).not.toHaveBeenCalled();
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

    expect.assertions(3);

    remove.mockImplementation(() => Promise.reject(new Error('Error removing')));
    await expect(mockedStore.dispatch(removeNoteThunkAction({ ids })))
      .rejects.toMatchObject({ message: expect.stringMatching(expectedErrorMsg) });
    expect(remove).toHaveBeenCalledWith({ ids, userId: initialState.userInfo.id });
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
    await expect(mockedStore.dispatch(removeNoteThunkAction({ ids })))
      .rejects.toMatchObject({ message: expect.stringMatching(expectedErrorMsg) });
    expect(remove).not.toHaveBeenCalled();
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });
});
