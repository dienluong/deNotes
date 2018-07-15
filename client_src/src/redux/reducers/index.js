import activeNode from './activeNodeReducer';
import notesTree from './notesTreeReducer';
import { combineReducers } from 'redux';

let rootReducer = combineReducers({ notesTree, activeNode });
export default rootReducer;
