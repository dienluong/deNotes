/* Nomenclature:
 *  - Notes Tree: a tree hierarchy of folders and notes
 *  - Node: an element in the Notes Tree that could represent either a Folder, or a Note
 *  - Folder: a node that may contain other nodes
 *  - Note: a node representing a user-written note
 */
const notesListActionTypes = {
  SELECT_NODE: 'SELECT_NODE',
  NAVIGATE_TO_NODE: 'NAVIGATE_TO_NODE',
  CHANGE_NOTES_TREE: 'CHANGE_NOTES_TREE',
  CHANGE_NODE_TITLE: 'CHANGE_NODE_TITLE',
  DELETE_NODE: 'DELETE_NODE',
  SWITCH_NODE_ON_DELETE: 'SWITCH_NODE_ON_DELETE',
};

export default notesListActionTypes;
