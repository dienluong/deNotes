import activeNode from './activeNodeReducer';
import notesTree from './notesTreeReducer';
import editorContent from './editorContentReducer';
import reducedReducer from './reducedReducer';
import { combineReducers } from 'redux';
import reduceReducers from 'reduce-reducers';

// TODO: remove
// import initNotesTree from '../../test/sample-tree';

const mainReducer = combineReducers({ notesTree, activeNode, editorContent });
const rootReducer = reduceReducers(mainReducer, reducedReducer);

export default rootReducer;
