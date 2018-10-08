import initialState from '../misc/initialState';
import Delta from 'quill-delta';
import uuid from 'uuid/v4';
import thunk from 'redux-thunk';
import setupMockStore from 'redux-mock-store';
import editorActionTypes from './constants/editorActionConstants';
import { changeContentAction, fetchEditorContentThunkAction } from './editorActions';
jest.mock('../../utils/editorContentStorage');
import { load } from '../../utils/editorContentStorage';


describe('changeContentAction action creator', () => {
  it('should return an object with expected content, delta and date in payload, and with the proper action type', () => {
    const delta = new Delta();
    const content = '<p>123<br></p>';
    const now = Date.now();
    const getContents = jest.fn();
    getContents.mockReturnValue(delta);

    const returned = changeContentAction({ editor: { getContents }, content });
    expect(returned).toMatchObject({
      type: editorActionTypes.CONTENT_CHANGED,
      payload: { newContent: { delta, content } },
    });
    expect(returned.payload.newContent.dateModified).toBeGreaterThanOrEqual(now);
  });
});


describe('fetchEditorContentThunkAction action creator', () => {
  const mockedStore = setupMockStore([thunk])(initialState);

  afterEach(() => {
    mockedStore.clearActions();
  });

  it('should return a rejected Promise and dispatch a FAILURE-type action if no storage has been setup', async() => {
    load.mockImplementation(() => Promise.reject(new Error('Load aborted. Cause: No Storage implementation provided.')));
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

    expect.assertions(2);
    await expect(mockedStore.dispatch(fetchEditorContentThunkAction({ noteId })))
      .rejects.toMatchObject({ message: expect.stringMatching(expectedErrorMsg) });
    expect(mockedStore.getActions()).toEqual(expectedActions);
  });

  it('should return a rejected Promise and dispatch a FAILURE-type action if fetched content has wrong format', async() => {
    // mock the load function, which is expected to be called by the tested function, to return unexpected format
    load.mockImplementation(() => Promise.resolve({ data: 'wrong format' }));
    const noteId = uuid();
    const expectedErrorMsg = /unrecognized/i;
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

    expect.assertions(2);
    await expect(mockedStore.dispatch(fetchEditorContentThunkAction({ noteId })))
      .rejects.toMatchObject({ message: expect.stringMatching(expectedErrorMsg) });

    expect(mockedStore.getActions()).toEqual(expectedActions);
  });
});
