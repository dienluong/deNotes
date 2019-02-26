import reducer from './activeNodeReducer';
import notesListActionTypes from '../actions/constants/notesListActionConstants';
import initialState from '../misc/initialState';

describe('activeNodeReducer ', () => {
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

    // If provided, use path instead of current active path
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

  it('should change active path and set ID to empty string, on NAVIGATE_PATH action', () => {
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
      id: '',
      path: [...currentState.path.slice(0, selectedPathSegmentIdx + 1), ''],
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

  it('should switch to 1st child of folder on SWITCH_NODE_ON_DELETE action, if deleted node is the active node or its parent.', () => {
    const currentState = {
      id: 'active1',
      path: ['segment0', 'segment1', 'segment2', 'active1'],
    };

    // Delete one of current active node's parents
    let payload = {
      deletedNodeId: currentState.path[1],
      children: [{ id: 'child0' }, { id: 'child1' }, { id: 'child2' }],
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.SWITCH_NODE_ON_DELETE,
      payload,
    })).toEqual({
      id: payload.children[0].id,
      path: ['segment0', payload.children[0].id],
    });

    // Delete active node itself
    payload = {
      deletedNodeId: currentState.id,
      children: [{ id: 'child0' }, { id: 'child1' }, { id: 'child2' }],
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.SWITCH_NODE_ON_DELETE,
      payload,
    })).toEqual({
      id: payload.children[0].id,
      path: [...currentState.path.slice(0, -1), payload.children[0].id],
    });

    // If deleted node is not on current active path, no change to active path, nor active ID
    payload = {
      deletedNodeId: 'not-currently-active',
      children: [{ id: 'child0' }, { id: 'child1' }, { id: 'child2' }],
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.SWITCH_NODE_ON_DELETE,
      payload,
    })).toBe(currentState);

    // If folder is empty, then empty string for active ID
    payload = {
      deletedNodeId: 'active1',
      children: [],
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.SWITCH_NODE_ON_DELETE,
      payload,
    })).toEqual({
      id: '',
      path: [...currentState.path.slice(0, -1), ''],
    });
  });

  it('should switch active node to first child in folder on SWITCH_NODE_ON_TREE_FOLDER_CHANGE action', () => {
    const currentState = {
      id: 'current-active-id',
      path: ['seg0', 'seg1', 'seg2', 'current-active-id'],
    };
    let newFolder = [{ id: 'child0' }, { id: 'child1' }, { id: 'child2' }];

    expect(reducer(currentState, {
      type: notesListActionTypes.SWITCH_NODE_ON_TREE_FOLDER_CHANGE,
      payload: {
        folder: newFolder,
      },
    })).toEqual({
      id: newFolder[0].id,
      path: [...currentState.path.slice(0, -1), newFolder[0].id],
    });

    // If no child in folder, then empty string as active ID
    newFolder = [];
    expect(reducer(currentState, {
      type: notesListActionTypes.SWITCH_NODE_ON_TREE_FOLDER_CHANGE,
      payload: {
        folder: newFolder,
      },
    })).toEqual({
      id: '',
      path: [...currentState.path.slice(0, -1), ''],
    });
    // should also work if current active node is empty string
    currentState.id = '';
    currentState.path = [''];
    expect(reducer(currentState, {
      type: notesListActionTypes.SWITCH_NODE_ON_TREE_FOLDER_CHANGE,
      payload: {
        folder: newFolder,
      },
    })).toEqual({
      id: '',
      path: [...currentState.path.slice(0, -1), ''],
    });

    // If current active node is still in folder after folder change, it remains the active node
    newFolder = [{ id: currentState.id }, { id: 'some-other-child-id' }, { id: 'another-child-id' }];
    expect(reducer(currentState, {
      type: notesListActionTypes.SWITCH_NODE_ON_TREE_FOLDER_CHANGE,
      payload: {
        folder: newFolder,
      },
    })).toBe(currentState);
  });
});
