/* Nomenclature:
 *  - Notes Tree: a tree hierarchy of folders and notes
 *  - Node: an element in the Notes Tree that could represent either a Folder, or a Note
 *  - Folder: a node that may contain other nodes
 *  - Note: a node representing a user-written note
 */
const notesListActionTypes = {
  SELECT_NODE: 'SELECT_NODE',
  NAVIGATE_PATH: 'NAVIGATE_PATH',
  CHANGE_NOTES_TREE: 'CHANGE_NOTES_TREE',
  CHANGE_NOTES_TREE_FOLDER: 'CHANGE_NOTES_TREE_FOLDER',
  SWITCH_NODE_ON_TREE_FOLDER_CHANGE: 'SWITCH_NODE_ON_TREE_FOLDER_CHANGE',
  CHANGE_NODE_TITLE: 'CHANGE_NODE_TITLE',
  DELETE_NODE: 'DELETE_NODE',
  SWITCH_NODE_ON_DELETE: 'SWITCH_NODE_ON_DELETE',
  ADD_NODE: 'ADD_NODE',
  FETCH_NOTES_TREE: 'FETCH_NOTES_TREE',
  FETCH_NOTES_TREE_SUCCESS: 'FETCH_NOTES_TREE_SUCCESS',
  FETCH_NOTES_TREE_FAILURE: 'FETCH_NOTES_TREE_FAILURE',
};

export default notesListActionTypes;
