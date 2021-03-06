import activeNode, * as fromActiveNode from './activeNodeReducer';
import notesTree, * as fromNotesTree from './notesTreeReducer';
import editorContent, * as fromEditorContent from './editorContentReducer';
import userInfo, * as fromUserInfo from './userInfoReducer';
import modalInfo, * as fromModalInfo from './modalInfoReducer';
import connectionInfo, * as fromConnectionInfo from './connectionInfoReducer';
import reducedReducer from './reducedReducer';
import { combineReducers } from 'redux';
import reduceReducers from 'reduce-reducers';

const mainReducer = combineReducers({ userInfo, notesTree, activeNode, editorContent, modalInfo, connectionInfo });
const rootReducer = reduceReducers(mainReducer, reducedReducer);

export default rootReducer;
export const selectNotesTree = (state: AppStateT) => state.notesTree;
export const selectNotesTreeTree = (state: AppStateT) => fromNotesTree.selectTree(state.notesTree);
export const selectNotesTreeVisible = (state: AppStateT) => fromNotesTree.selectVisible(state.notesTree);
export const selectNotesTreeEditMode = (state: AppStateT) => fromNotesTree.selectEditMode(state.notesTree);
export const selectNotesTreeEditModeSelectedNodes = (state: AppStateT) => fromNotesTree.selectEditModeSelectedNodes(state.notesTree);
export const selectActiveNode = (state: AppStateT) => state.activeNode;
export const selectActiveNodePath = (state: AppStateT) => fromActiveNode.selectPath(state.activeNode);
export const selectActiveNodeId = (state: AppStateT) => fromActiveNode.selectId(state.activeNode);
export const selectEditorContent = (state: AppStateT) => state.editorContent;
export const selectEditorContentId = (state: AppStateT) => fromEditorContent.selectId(state.editorContent);
export const selectEditorContentTitle = (state: AppStateT) => fromEditorContent.selectTitle(state.editorContent);
export const selectEditorContentContent = (state: AppStateT) => fromEditorContent.selectContent(state.editorContent);
export const selectEditorContentDelta = (state: AppStateT) => fromEditorContent.selectDelta(state.editorContent);
export const selectEditorContentDateCreated = (state: AppStateT) => fromEditorContent.selectDateCreated(state.editorContent);
export const selectEditorContentDateModified = (state: AppStateT) => fromEditorContent.selectDateModified(state.editorContent);
export const selectEditorContentReadOnly = (state: AppStateT) => fromEditorContent.selectReadOnly(state.editorContent);
export const selectUserInfoId = (state: AppStateT) => fromUserInfo.selectId(state.userInfo);
export const selectModalInfoType = (state: AppStateT) => fromModalInfo.selectType(state.modalInfo);
export const selectModalInfoProps = (state: AppStateT) => fromModalInfo.selectProps(state.modalInfo);
export const selectConnectionInfoLoggedIn = (state: AppStateT) => fromConnectionInfo.selectLoggedIn(state.connectionInfo);
