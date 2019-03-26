import activeNode, * as fromActiveNode from './activeNodeReducer';
import notesTree, * as fromNotesTree from './notesTreeReducer';
import editorContent, * as fromEditorContent from './editorContentReducer';
import userInfo, * as fromUserInfo from './userInfoReducer';
import reducedReducer from './reducedReducer';
import { combineReducers } from 'redux';
import reduceReducers from 'reduce-reducers';

const mainReducer = combineReducers({ userInfo, notesTree, activeNode, editorContent });
const rootReducer = reduceReducers(mainReducer, reducedReducer);

export default rootReducer;
export const selectNotesTree = (state: AppStateT) => state.notesTree;
export const selectNotesTreeTree = (state: AppStateT) => fromNotesTree.selectTree(state.notesTree);
export const selectActiveNode = (state: AppStateT) => state.activeNode;
export const selectActiveNodePath = (state: AppStateT) => fromActiveNode.selectPath(state.activeNode);
export const selectActiveNodeId = (state: AppStateT) => fromActiveNode.selectId(state.activeNode);
export const selectEditorContent = (state: AppStateT) => state.editorContent;
export const selectEditorContentId = (state: AppStateT) => fromEditorContent.selectId(state.editorContent);
export const selectUserInfoId = (state: AppStateT) => fromUserInfo.selectId(state.userInfo);
