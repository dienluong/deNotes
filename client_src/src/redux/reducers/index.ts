import activeNode, * as fromActiveNode from './activeNodeReducer';
import notesTree, * as fromNotesTree from './notesTreeReducer';
import editorContent from './editorContentReducer';
import userInfo from './userInfoReducer';
import reducedReducer from './reducedReducer';
import { combineReducers } from 'redux';
import reduceReducers from 'reduce-reducers';

const mainReducer = combineReducers({ userInfo, notesTree, activeNode, editorContent });
const rootReducer = reduceReducers(mainReducer, reducedReducer);

export default rootReducer;
export const selectNotesTree = (state: AppStateT) => state.notesTree;
export const selectNotesTreeTree = (state: AppStateT) => fromNotesTree.selectTree(state.notesTree);
// TODO: remove
// export const selectNotesTreeId = (state) => fromNotesTree.selectTreeId(state.notesTree);
// export const selectNotesTreeDateCreated = (state) => fromNotesTree.selectDateCreated(state.notesTree);
// export const selectNotesTreeDateModified = (state) => fromNotesTree.selectDateModified(state.notesTree);
export const selectActiveNode = (state: AppStateT) => state.activeNode;
export const selectActiveNodePath = (state: AppStateT) => fromActiveNode.selectPath(state.activeNode);
export const selectActiveNodeId = (state: AppStateT) => fromActiveNode.selectId(state.activeNode);
export const selectEditorContent = (state: AppStateT) => state.editorContent;
