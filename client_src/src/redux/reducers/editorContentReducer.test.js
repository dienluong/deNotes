import Delta from 'quill-delta';
import reducer from './editorContentReducer';
import editorActionTypes from '../actions/constants/editorActionConstants';
import notesListActionTypes from '../actions/constants/notesListActionConstants';
import initialState from '../misc/initialState';

describe('editorContentReducer ', () => {
  const currentState = {
    id: 'current-editor-content',
    title: 'Default Content',
    content: '<p>Hello World<br></p>',
    delta: new Delta([
      { insert: 'Hello World' },
    ]),
    dateCreated: 1,
    dateModified: 2,
    readOnly: true,
  };

  it('should return the initial state by default', () => {
    expect(reducer(undefined, {})).toEqual(initialState.editorContent);
  });

  it('should return current state if no payload', () => {
    expect(reducer(currentState, { type: editorActionTypes.CONTENT_CHANGED })).toBe(currentState);
  });

  it('should, on CONTENT_CHANGED, return new state w/ recieved delta, content and refresh modified date.', () => {
    const newContent = {
      delta: new Delta([
        { insert: 'Goodnight People' },
      ]),
      content: '<p>Goodnight People<br></p>',
      dateModified: 300,
    };

    expect(reducer(currentState, {
      type: editorActionTypes.CONTENT_CHANGED,
      payload: {
        newContent,
      },
    })).toEqual({
      ...currentState,
      ...newContent,
    });
  });

  it('should, on FETCH_EDITOR_CONTENT_SUCCESS, return the new state w/ fetched data', () => {
    const fetchedData = {
      id: 'fetched-data',
      title: 'Fetched Note',
      content: '<p>This was saved.<br></p>',
      delta: new Delta([
        { insert: 'This was saved.' },
      ]),
      dateCreated: 101,
      dateModified: 202,
      readOnly: false,
    };

    expect(reducer(currentState, {
      type: editorActionTypes.FETCH_EDITOR_CONTENT_SUCCESS,
      payload: {
        editorContent: fetchedData,
      },
    })).toEqual({
      ...currentState,
      ...fetchedData,
    });
  });

  it('should, on CHANGE_NODE_TITLE, return new state w/ new title and refreshed modified date only if ID matches ID in current state', () => {
    const expectedDate = 123456;

    // The uniqid of the node in the payload matches the id of the current state. So expect new title to be returned.
    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NODE_TITLE,
      payload: {
        title: 'Changed Title',
        node: { uniqid: currentState.id },
        now: expectedDate,
      },
    })).toEqual({
      ...currentState,
      title: 'Changed Title',
      dateModified: expectedDate,
    });

    // Returns current state if ID received does not match current state's ID (the editor content's ID)
    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NODE_TITLE,
      payload: {
        title: 'Changed Title',
        node: { uniqid: 'non-matching-id' },
        now: 111222,
      },
    })).toBe(currentState);
  });

  it('should, on REMOVE_NOTE_SUCCESS, return initial state, i.e. blank content and read-only, if delete IDs matches ID of current state', () => {
    // lists of note IDs deleted, which includes the ID of our current state.
    let ids = ['deleted-note', currentState.id, 'some-other-note-deleted', 'another-note-removed'];

    expect(reducer(currentState, {
      type: editorActionTypes.REMOVE_NOTE_SUCCESS,
      payload: {
        ids,
        count: 4,
      },
    })).toEqual(initialState.editorContent);

    // Returns current state if none of the IDs matches current state's ID
    ids = ['deleted-note', 'some-other-note-deleted', 'another-note-removed'];
    expect(reducer(currentState, {
      type: editorActionTypes.REMOVE_NOTE_SUCCESS,
      payload: {
        ids,
        count: 3,
      },
    })).toBe(currentState);
  });
});
