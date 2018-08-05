import activeNode from './activeNodeReducer';
import notesTree from './notesTreeReducer';
import reducedReducer from './reducedReducer';
import { combineReducers } from 'redux';
import reduceReducers from 'reduce-reducers';
import uniqid from 'uniqid';

// TODO: remove
// import initNotesTree from '../../test/sample-tree';
const _ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER;

const root = [
  {
    title: '/',
    subtitle: '',
    uniqid: uniqid(),
    get id() {
      return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
    },
    type: 'folder',
    expanded: true,
    children: [],
  },
];

const initialState = {
  notesTree: root,
  activeNode: {
    id: root[0].id,
    path: [root[0].id],
  },
};

const mainReducer = combineReducers({ notesTree, activeNode });
const rootReducer = reduceReducers(mainReducer, reducedReducer, initialState);

export default rootReducer;
