import reducer from './activeNodeReducer';
import notesListActionTypes from '../actions/constants/notesListActionConstants';
import initialState from '../misc/initialState';
import { NONE_SELECTED, nodeTypes } from '../../utils/appCONSTANTS';
const ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER || '|^|';

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
    // Case where current active node is an ITEM
    let currentState = {
      id: `${nodeTypes.ITEM}${ID_DELIMITER}current-active-id`,
      path: [`${nodeTypes.FOLDER}${ID_DELIMITER}current-active-parent`, `${nodeTypes.ITEM}${ID_DELIMITER}current-active-id`],
    };
    const newActiveNode = {
      nodeId: `${nodeTypes.ITEM}${ID_DELIMITER}new-active-id`,
    };
    let expectedState = {
      id: newActiveNode.nodeId,
      path: [...currentState.path.slice(0, -1), newActiveNode.nodeId],
    };
    expect(reducer(currentState, {
      type: notesListActionTypes.SELECT_NODE,
      payload: newActiveNode,
    })).toEqual(expectedState);

    // Case where current active node is a FOLDER
    currentState = {
      id: `${nodeTypes.FOLDER}${ID_DELIMITER}current-active-id`,
      path: [`${nodeTypes.FOLDER}${ID_DELIMITER}current-active-parent`, `${nodeTypes.FOLDER}${ID_DELIMITER}current-active-id`],
    };
    expectedState = {
      id: newActiveNode.nodeId,
      path: [...currentState.path, newActiveNode.nodeId],
    };
    expect(reducer(currentState, {
      type: notesListActionTypes.SELECT_NODE,
      payload: newActiveNode,
    })).toEqual(expectedState);

    // If selected node ID is same as current state ID but do not equal NONE_SELECTED, simply return the current state (therefore, using expect.toBe())
    const sameActiveNode = {
      nodeId: currentState.id,
    };
    expect(reducer(currentState, {
      type: notesListActionTypes.SELECT_NODE,
      payload: sameActiveNode,
    })).toBe(currentState);

    // If selected node ID and active node ID are the same *BUT* equal NONE_SELECTED, compute new state, i.e. does not simply return current state.
    currentState = {
      id: NONE_SELECTED,
      path: [`${nodeTypes.FOLDER}${ID_DELIMITER}current-active-parent`, `${nodeTypes.FOLDER}${ID_DELIMITER}current-active-id`, NONE_SELECTED],
    };

    const noneSelected = {
      nodeId: NONE_SELECTED,
      path: [NONE_SELECTED],
    };
    expectedState = {
      id: noneSelected.nodeId,
      path: noneSelected.path,
    };
    expect(reducer(currentState, {
      type: notesListActionTypes.SELECT_NODE,
      payload: noneSelected,
    })).toEqual(expectedState);

    // If active node is root folder, i.e. id: NONE_SELECTED, path: [NONE_SELECTED]
    currentState = {
      id: NONE_SELECTED,
      path: [NONE_SELECTED],
    };
    expectedState = {
      id: newActiveNode.nodeId,
      path: [newActiveNode.nodeId],
    };
    expect(reducer(currentState, {
      type: notesListActionTypes.SELECT_NODE,
      payload: newActiveNode,
    })).toEqual(expectedState);

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

  it('should change active path and set ID, on NAVIGATE_PATH action', () => {
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
      path: [...currentState.path.slice(0, selectedPathSegmentIdx + 1)],
    });

    // If selected node is the last node in path, return current state
    selectedPathSegmentIdx = currentState.path.length - 1;
    expect(reducer(currentState, {
      type: notesListActionTypes.NAVIGATE_PATH,
      payload: {
        idx: selectedPathSegmentIdx,
      },
    })).toBe(currentState);
  });

  it('should go up one folder on GO_UP_A_FOLDER', () => {
    // ---> Test case where active node is an ITEM
    let currentState = {
      id: `${nodeTypes.ITEM}${ID_DELIMITER}2222`,
      path: [`${nodeTypes.FOLDER}${ID_DELIMITER}0000`, `${nodeTypes.FOLDER}${ID_DELIMITER}1111`, `${nodeTypes.ITEM}${ID_DELIMITER}2222`],
    };
    expect(reducer(currentState, {
      type: notesListActionTypes.GO_UP_A_FOLDER,
      payload: {},
    })).toEqual({
      id: currentState.path[0],
      path: currentState.path.slice(0, 1),
    });

    // ---> Test case where active node is a FOLDER
    currentState = {
      id: `${nodeTypes.FOLDER}${ID_DELIMITER}1111`,
      path: [`${nodeTypes.FOLDER}${ID_DELIMITER}0000`, `${nodeTypes.FOLDER}${ID_DELIMITER}1111`],
    };
    expect(reducer(currentState, {
      type: notesListActionTypes.GO_UP_A_FOLDER,
      payload: {},
    })).toEqual({
      id: currentState.path[0],
      path: currentState.path.slice(0, 1),
    });

    // ---> Test case where active node is a FOLDER in root; should switch to root folder
    currentState = {
      id: `${nodeTypes.FOLDER}${ID_DELIMITER}0000`,
      path: [`${nodeTypes.FOLDER}${ID_DELIMITER}0000`],
    };
    expect(reducer(currentState, {
      type: notesListActionTypes.GO_UP_A_FOLDER,
      payload: {},
    })).toEqual({
      id: NONE_SELECTED,
      path: [NONE_SELECTED],
    });

    // ---> Test case where active node is root folder
    currentState = {
      id: NONE_SELECTED,
      path: [NONE_SELECTED],
    };
    expect(reducer(currentState, {
      type: notesListActionTypes.GO_UP_A_FOLDER,
      payload: {},
    })).toEqual({
      id: NONE_SELECTED,
      path: [NONE_SELECTED],
    });
  });

  it('should return state NONE_SELECTED/[NONE_SELECTED] on GO_TO_ROOT action', () => {
    const currentState = initialState.activeNode;
    expect(reducer(currentState, {
      type: notesListActionTypes.GO_TO_ROOT,
      payload: {},
    }));
  });

  it('should switch to parent folder on SWITCH_NODE_ON_DELETE action, if deleted node is the active node or is part of its path.', () => {
    const currentState = {
      id: 'active1',
      path: ['segment0', 'segment1', 'segment2', 'active1'],
    };

    // Delete one of current active node's parents
    let payload = {
      deletedNodeId: currentState.path[1],
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.SWITCH_NODE_ON_DELETE,
      payload,
    })).toEqual({
      id: currentState.path[0],
      path: [currentState.path[0]],
    });

    // Delete active node itself
    payload = {
      deletedNodeId: currentState.id,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.SWITCH_NODE_ON_DELETE,
      payload,
    })).toEqual({
      id: currentState.path[2],
      path: [...currentState.path.slice(0, -1)],
    });

    // Deleting the parent folder at the root
    payload = {
      deletedNodeId: currentState.path[0],
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.SWITCH_NODE_ON_DELETE,
      payload,
    })).toEqual({
      id: NONE_SELECTED,
      path: [NONE_SELECTED],
    });


    // If deleted node is not on current active path, no change to active path, nor active ID
    payload = {
      deletedNodeId: 'not-currently-active',
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.SWITCH_NODE_ON_DELETE,
      payload,
    })).toBe(currentState);
  });

/*
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

    // If no child in folder, then NONE_SELECTED as active ID
    newFolder = [];
    expect(reducer(currentState, {
      type: notesListActionTypes.SWITCH_NODE_ON_TREE_FOLDER_CHANGE,
      payload: {
        folder: newFolder,
      },
    })).toEqual({
      id: NONE_SELECTED,
      path: [...currentState.path.slice(0, -1), NONE_SELECTED],
    });
    // should also work if no current active node selected
    currentState.id = NONE_SELECTED;
    currentState.path = [NONE_SELECTED];
    expect(reducer(currentState, {
      type: notesListActionTypes.SWITCH_NODE_ON_TREE_FOLDER_CHANGE,
      payload: {
        folder: newFolder,
      },
    })).toEqual({
      id: NONE_SELECTED,
      path: [...currentState.path.slice(0, -1), NONE_SELECTED],
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
*/
});
