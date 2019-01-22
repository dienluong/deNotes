import reducer from './activeNodeReducer';
import notesListActionTypes from '../actions/constants/notesListActionConstants';
import initialState from '../misc/initialState';

describe('activeNodeReducer', () => {
  it('should return initial state by default', () => {
    expect(reducer(undefined, {})).toBe(initialState.activeNode);
  });

  it('should return current state if no payload', () => {
    const currentState = {
      id: 'default-active-id',
      path: ['default-active-parent-1', 'default-active-parent-2', 'default-active-id'],
    };
    expect(reducer(currentState, {
      type: notesListActionTypes.SELECT_NODE,
    })).toBe(currentState);
  });

  it('should return active node on SELECT_NODE action', () => {
    const currentState = {
      id: 'current-active-id',
      path: ['current-active-parent', 'current-active-id'],
    };
    const newActiveNode = {
      nodeId: 'new-active-id',
    };
    const expectedState = {
      id: newActiveNode.nodeId,
      path: [currentState.path[0], newActiveNode.nodeId],
    };
    expect(reducer(currentState, {
      type: notesListActionTypes.SELECT_NODE,
      payload: newActiveNode,
    })).toEqual(expectedState);

    // If selected node is same as current state, return the current state (therefore, using expect.toBe())
    const sameActiveNode = {
      nodeId: currentState.id,
    };
    expect(reducer(currentState, {
      type: notesListActionTypes.SELECT_NODE,
      payload: sameActiveNode,
    })).toBe(currentState);

    // If payload is invalid, return current state
    const invalidPayload = {
      invalidProp: 'current-active-id',
    };
    expect(reducer(currentState, {
      type: notesListActionTypes.SELECT_NODE,
      payload: invalidPayload,
    })).toBe(currentState);

    // Use provided path instead of current active path, when provided one
    const payloadWithPath = {
      nodeId: 'another-new-active-id',
      path: ['another-new-active-id'],
    };
    expect(reducer(currentState, {
      type: notesListActionTypes.SELECT_NODE,
      payload: payloadWithPath,
    })).toEqual({
      id: payloadWithPath.nodeId,
      path: payloadWithPath.path,
    });
  });

  it('should change active node and path on NAVIGATE_PATH action', () => {
    const currentState = {
      id: 'active1',
      path: ['segment0', 'segment1', 'segment2', 'active1'],
    };

    let selectedPathSegmentIdx = 1;
    expect(reducer(currentState, {
      type: notesListActionTypes.NAVIGATE_PATH,
      payload: {
        idx: selectedPathSegmentIdx,
      },
    })).toEqual({
      id: currentState.path[selectedPathSegmentIdx],
      path: currentState.path.slice(0, selectedPathSegmentIdx + 1),
    });

    // If selected node is same as current state, return current state
    selectedPathSegmentIdx = currentState.path.length - 1;
    expect(reducer(currentState, {
      type: notesListActionTypes.NAVIGATE_PATH,
      payload: {
        idx: selectedPathSegmentIdx,
      },
    })).toBe(currentState);
  });

  it('should switch to appropriate node on SWITCH_NODE_ON_DELETE action, if deleted node is either 1) active node\'s parent or 2) the active node itself.', () => {
    const currentState = {
      id: 'active1',
      path: ['segment0', 'segment1', 'segment2', 'active1'],
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

    // If deleted node is not on current active path, no change to active path, nor active ID
    deletedNode = {
      id: 'notParent',
      path: ['segment0', 'segment1', 'segment2', 'active1', 'moreSegment', 'notParent'],
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.SWITCH_NODE_ON_DELETE,
      payload: {
        deletedNode,
      },
    })).toBe(currentState);

    // If deleted node is not on current active path, no change to active path, nor active ID
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
