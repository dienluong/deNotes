import activeNode, * as fromActiveNode from './activeNodeReducer';
import notesTree, * as fromNotesTree from './notesTreeReducer';
import editorContent from './editorContentReducer';
import reducedReducer from './reducedReducer';
import { combineReducers } from 'redux';
import reduceReducers from 'reduce-reducers';

const mainReducer = combineReducers({ notesTree, activeNode, editorContent });
const rootReducer = reduceReducers(mainReducer, reducedReducer);

export default rootReducer;
export const selectNotesTree = (state) => state.notesTree;
export const selectNotesTreeTree = (state) => fromNotesTree.selectTree(state.notesTree);
export const selectNotesTreeDateCreated = (state) => fromNotesTree.selectDateCreated(state.notesTree);
export const selectNotesTreeDateModified = (state) => fromNotesTree.selectDateModified(state.notesTree);
export const selectActiveNode = (state) => state.activeNode;
export const selectActiveNodePath = (state) => fromActiveNode.selectPath(state.activeNode);
export const selectEditorContent = (state) => state.editorContent;
