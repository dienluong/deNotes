import reducer from './reducedReducer';
import connectionInfoActionTypes from '../actions/constants/connectionInfoActionConstants';
import notesListActionTypes from '../actions/constants/notesListActionConstants';
import initialState from '../misc/initialState';
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

  const userInfo = {
    id: 'test_user',
  };

  const modalInfo = {
    type: '',
    props: {},
  };

  const connectionInfo = {
    loggedIn: true,
  };

  let currentState;

  beforeEach(() => {
    currentState = {
      ...initialState,
      notesTree,
      activeNode,
      editorContent,
      userInfo,
      modalInfo,
      connectionInfo,
    };
  });

  it('should return the initial state by default', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should return current state if no payload', () => {
    expect(reducer(currentState, { type: notesListActionTypes.ADD_NODE })).toBe(currentState);
  });

  it('should return initial state (i.e. reset state) on LOGGED_OUT', () => {
    expect(reducer(currentState, { type: connectionInfoActionTypes.LOGGED_OUT, payload: { loggedIn: false } })).toEqual(initialState);
  });
});
