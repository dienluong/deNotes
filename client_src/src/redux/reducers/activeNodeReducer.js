import notesListActionTypes from '../actions/constants/notesListActionConstants';

let initialActiveNode = {
  id: null,
  path: [],
};

export default function activeNodeReducer(state = initialActiveNode, action) {
  switch (action.type) {
    case notesListActionTypes.CHANGE_ACTIVE_NODE:
      return {
        id: action.payload.activeNode.id,
        path: action.payload.activeNode.path,
      };
    default:
      return state;
  }
}
