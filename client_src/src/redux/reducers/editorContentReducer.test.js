import Delta from 'quill-delta';
import reducer from './editorContentReducer';
import editorActionTypes from '../actions/constants/editorActionConstants';
import notesListActionTypes from '../actions/constants/notesListActionConstants';
import initialState from '../misc/initialState';

describe('editorContentReducer', () => {
  const RealDate = global.Date;

  afterEach(() => {
    global.Date = RealDate;
  });

  it('should return the initial state by default', () => {
    expect(reducer(undefined, {})).toEqual(initialState.editorContent);
  });

  it('should, on CONTENT_CHANGED, return new state w/ recieved delta and content and refresh modified date.', () => {
    const currentState = {
      id: 'initial-editor-content',
      title: 'Default Content',
      content: '<p>Hello World<br></p>',
      delta: new Delta([
        { insert: 'Hello World' },
      ]),
      dateCreated: 1,
      dateModified: 2,
      readOnly: true,
    };

    const newDelta = new Delta([
      { insert: 'Goodnight People' },
    ]);

    expect(reducer(currentState, {
      type: editorActionTypes.CONTENT_CHANGED,
      payload: {
        newContent: {
          delta: newDelta,
          content: '<p>Goodnight People<br></p>',
          dateModified: 300,
        },
      },
    })).toEqual({
      id: 'initial-editor-content',
      title: 'Default Content',
      content: '<p>Goodnight People<br></p>',
      delta: newDelta,
      dateCreated: 1,
      dateModified: 300,
      readOnly: true,
    });
  });

  it('should, on FETCH_EDITOR_CONTENT_SUCCESS, return the new state w/ fetched data', () => {
    const currentState = {
      id: 'initial-editor-content',
      title: 'Default Content',
      content: '<p>Hello World<br></p>',
      delta: new Delta([
        { insert: 'Hello World' },
      ]),
      dateCreated: 1,
      dateModified: 2,
      readOnly: true,
    };

    const newDelta = new Delta([
      { insert: 'This was saved.' },
    ]);
    const fetchedData = {
      id: 'fetched-data',
      title: 'Fetched Note',
      content: '<p>This was saved.<br></p>',
      delta: newDelta,
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

      id: 'fetched-data',
      title: 'Fetched Note',
      content: '<p>This was saved.<br></p>',
      delta: newDelta,
      dateCreated: 101,
      dateModified: 202,
      readOnly: false,
    });
  });

  it('should, on CHANGE_NODE_TITLE, return new state w/ new title and refreshed modified date only if ID matches ID in current state', () => {
    const expectedDate = 1001;
    const expectedDelta = new Delta([
      { insert: 'Hello World' },
    ]);

    global.Date = class extends RealDate {
      constructor() {
        super(expectedDate);
      }

      static now() {
        return expectedDate;
      }
    };

    const currentState = {
      id: 'initial-editor-content',
      title: 'Default Content',
      content: '<p>Hello World<br></p>',
      delta: expectedDelta,
      dateCreated: 1,
      dateModified: 2,
      readOnly: true,
    };

    // The uniqid of the node in the payload matches the id of the current state. So expect new title to be returned.
    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NODE_TITLE,
      payload: {
        title: 'Changed Title',
        node: { uniqid: 'initial-editor-content' },
        path: ['segment0', 'segment1', 'node-whose-title-changed'],
      },
    })).toEqual({
      id: 'initial-editor-content',
      title: 'Changed Title',
      content: '<p>Hello World<br></p>',
      delta: expectedDelta,
      dateCreated: 1,
      dateModified: expectedDate,
      readOnly: true,
    });

    // Returns current state if ID does not match current state's ID
    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NODE_TITLE,
      payload: {
        title: 'Changed Title',
        node: { uniqid: 'non-matching-id' },
        path: ['segment0', 'segment1', 'non-matching-id'],
      },
    })).toBe(currentState);
  });

  it('should, on REMOVE_NOTE_SUCCESS, return initial state, i.e. blank content and read-only, if delete IDs matches ID of current state', () => {
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

    // lists of note IDs deleted, which includes the ID of our current state.
    let ids = ['deleted-note', 'current-editor-content', 'some-other-note-deleted', 'another-note-removed'];

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
