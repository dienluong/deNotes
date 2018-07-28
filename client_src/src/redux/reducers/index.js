import activeNode from './activeNodeReducer';
import notesTree from './notesTreeReducer';
import reducedReducer from './reducedReducer';
import { combineReducers } from 'redux';
import reduceReducers from 'reduce-reducers';
import initNotesTree from '../../test/sample-tree';

const initialState = {
  notesTree: initNotesTree,
  activeNode: {
    id: null,
    path: [],
  },
};

const mainReducer = combineReducers({ notesTree, activeNode });
const rootReducer = reduceReducers(mainReducer, reducedReducer, initialState);

export default rootReducer;
