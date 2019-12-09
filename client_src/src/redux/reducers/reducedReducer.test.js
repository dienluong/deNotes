import reducer from './reducedReducer';
import notesListActionTypes from '../actions/constants/notesListActionConstants';
import initialState from '../misc/initialState';
jest.mock('uuid/v4');
import uuid from 'uuid/v4';
import { NONE_SELECTED } from '../../utils/appCONSTANTS';
import { mockedTree } from '../../test-utils/mocks/mockedNotesTree';

describe('reducedReducer', () => {
  const notesTree = {
    id: 'current-tree-id',
    tree: mockedTree,
    dateCreated: 11,
    dateModified: 22,
  };

  // No node selected by default
  const activeNode = {
    id: NONE_SELECTED,
    path: [NONE_SELECTED],
  };

  const editorContent = {
    ...initialState.editorContent,
    id: 'default',
    title: 'Default Editor Content',
    content: '<p>Default Editor Content<br></p>',
    dateCreated: 663399,
    dateModified: 993366,
    readOnly: false,
  };

  let currentState;

  beforeEach(() => {
    currentState = {
      ...initialState,
      notesTree,
      activeNode,
      editorContent,
    };
  });
  afterEach(() => {
    uuid.mockClear();
  });

  it('should return the initial state by default', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should return current state if no payload', () => {
    expect(reducer(currentState, { type: notesListActionTypes.ADD_NODE })).toBe(currentState);
  });

});
