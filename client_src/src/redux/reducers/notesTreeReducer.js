import notesListActionTypes from '../actions/constants/notesListActionConstants';
import sampleNotes from '../../test/sample-tree';

let initialNotesTree = sampleNotes;

export default function notesTreeReducer(state = initialNotesTree, action) {
  switch (action.type) {
    case notesListActionTypes.CHANGE_NOTES_TREE:
      return action.payload.notesTree;
    default:
      return state;
  }
}
