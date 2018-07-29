import activeNode from './activeNodeReducer';
import notesTree from './notesTreeReducer';
import reducedReducer from './reducedReducer';
import { combineReducers } from 'redux';
import reduceReducers from 'reduce-reducers';
import uniqid from 'uniqid';
import initNotesTree from '../../test/sample-tree';
const _ID_DELIMITER = '|^|';

const root = [{
  title: '/',
  subtitle: '',
  uniqid: uniqid(),
  get id() {
    return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
  },
  type: 'folder',
  expanded: true,
  children: initNotesTree,
}];

const initialState = {
  notesTree: root,
  activeNode: {
    id: null,
    path: [],
  },
};

const mainReducer = combineReducers({ notesTree, activeNode });
const rootReducer = reduceReducers(mainReducer, reducedReducer, initialState);

export default rootReducer;
