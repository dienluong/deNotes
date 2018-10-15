import reducer from './activeNodeReducer';
import notesListActionTypes from '../actions/constants/notesListActionConstants';
import initialState from '../misc/initialState';

describe('activeNodeReducer', () => {
  it('should return initial state by default', () => {
    expect(reducer(undefined, {})).toEqual(initialState.activeNode);
  });

  it('should return selected node on SELECT_NODE', () => {
    const currentState = {
      id: 'current-active-id',
      path: ['current-active-id'],
    };
    const newActiveNode = {
      id: 'new-active-id',
      path: ['new-active-id'],
    };
    expect(reducer(currentState, {
      type: notesListActionTypes.SELECT_NODE,
      payload: { activeNode: newActiveNode },
    })).toEqual(newActiveNode);

    // If given node is same as current state, return the current state (therefore, using expect.toBe())
    const sameActiveNode = {
      id: 'current-active-id',
      path: ['current-active-id'],
    };
    expect(reducer(currentState, {
      type: notesListActionTypes.SELECT_NODE,
      payload: { activeNode: sameActiveNode },
    })).toBe(currentState);
  });

  it('should change active node on NAVIGATE_PATH action', () => {
    const currentState = {
      id: 'active1',
      path: ['segment0', 'segment1', 'segment2', 'active1', 'moreSegment'],
    };

    let selectedPathSegment = 1;
    expect(reducer(currentState, {
      type: notesListActionTypes.NAVIGATE_PATH,
      payload: {
        idx: selectedPathSegment,
      },
    })).toEqual({
      id: currentState.path[selectedPathSegment],
      path: currentState.path,
    });

    // If selected node is same as current state, return current state
    selectedPathSegment = currentState.path.length - 2;
    expect(reducer(currentState, {
      type: notesListActionTypes.NAVIGATE_PATH,
      payload: {
        idx: selectedPathSegment,
      },
    })).toBe(currentState);
  });

  it('should switch to appropriate node on action SWITCH_NODE_ON_DELETE, if deleted node is either 1) active node\'s parent or 2) the active node itself.', () => {
    const currentState = {
      id: 'active1',
      path: ['segment0', 'segment1', 'segment2', 'active1', 'moreSegment', 'notParent'],
    };

    // Delete one of current active node's parents
    let deletedNode = {
      id: 'segment1',
      path: ['segment0', 'segment1', 'segment2'],
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.SWITCH_NODE_ON_DELETE,
      payload: {
        deletedNode,
      },
    })).toEqual({
      id: 'segment0',
      path: ['segment0'],
    });

    // Delete active node itself
    deletedNode = {
      id: 'active1',
      path: ['segment0', 'segment1', 'segment2', 'active1'],

    };

    expect(reducer(currentState, {
      type: notesListActionTypes.SWITCH_NODE_ON_DELETE,
      payload: {
        deletedNode,
      },
    })).toEqual({
      id: 'segment2',
      path: ['segment0', 'segment1', 'segment2'],
    });

    // Active node ID should not change, only the path does, if deleted node is on the path but not one of current active node's parents
    deletedNode = {
      id: 'notParent',
      path: ['segment0', 'segment1', 'segment2', 'active1', 'moreSegment', 'notParent'],
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.SWITCH_NODE_ON_DELETE,
      payload: {
        deletedNode,
      },
    })).toEqual({
      id: currentState.id,
      path: ['segment0', 'segment1', 'segment2', 'active1', 'moreSegment'],
    });

    // Both active node ID and path should not change if deleted node is on the active path
    deletedNode = {
      id: 'notInPath',
      path: ['segment0', 'segment1', 'segment2', 'notInPath'],
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.SWITCH_NODE_ON_DELETE,
      payload: {
        deletedNode,
      },
    })).toBe(currentState);
  });
});
