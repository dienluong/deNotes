import activeNode from './activeNodeReducer';
import notesTree from './notesTreeReducer';
import editorContent from './editorContentReducer';
import reducedReducer from './reducedReducer';
import { combineReducers } from 'redux';
import reduceReducers from 'reduce-reducers';
import uuid from 'uuid/v1';
import Delta from 'quill-delta';

// TODO: remove
// import initNotesTree from '../../test/sample-tree';
const _ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER;

const root = [
  {
    title: '/',
    subtitle: '',
    uniqid: uuid(),
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
  editorContent: {
    content: '',
    delta: new Delta(),
  },
};

const mainReducer = combineReducers({ notesTree, activeNode, editorContent });
const rootReducer = reduceReducers(mainReducer, reducedReducer, initialState);

export default rootReducer;
