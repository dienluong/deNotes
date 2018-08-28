import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import Delta from 'quill-delta';
import { createStore } from 'redux';
import rootReducer from './redux/reducers';
import { Provider } from 'react-redux';
import baseState from './redux/misc/initialState';
import { Observable } from 'rxjs/Rx';
import uuid from 'uuid/v1';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/auditTime';
import notesTreeObserver from './reactive/notesTreeObserver';
import editorContentObserver from './reactive/editorContentObserver';
import * as notesTreeStorage from './utils/notesTreeStorage';
import * as editorContentStorage from './utils/editorContentStorage';
import { save, load } from './utils/loopbackREST';

// Use loopbackREST for loading and saving persisted data
notesTreeStorage.inject({ save, load });
editorContentStorage.inject({ save, load });

const _ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER;
// TODO: adjust user ID to logged in user
const userId = process.env.REACT_APP_USER_ID;

// TODO: Is it the best place to define this?
const rootNode = [
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

let initialState = {
  ...baseState,
  notesTree: rootNode,
  activeNode: {
    id: rootNode[0].id,
    path: [rootNode[0].id],
  },
};

function render({ initialState = null }) {
  let store = null;
  if (initialState) {
    store = createStore(rootReducer, initialState);
  } else {
    store = createStore(rootReducer);
  }
  const notesTree$ = Observable.from(store).pluck('notesTree').auditTime(3000);
  const editorContent$ = Observable.from(store).pluck('editorContent').auditTime(3000);
  const myNotesTreeObserver = notesTreeObserver(userId);
  const myEditorContentObserver = editorContentObserver(userId);
  notesTree$.subscribe(myNotesTreeObserver);
  editorContent$.subscribe(myEditorContentObserver);

  ReactDOM.render(<Provider store={ store }><App /></Provider>, document.getElementById('root'));
  registerServiceWorker();
}

notesTreeStorage.loadTree({ userId })
  .then(treesArray => {
    if (Array.isArray(treesArray) && treesArray.length) {
      // In the unexpected case where there are more than one tree for the same user, use the last one.
      const notesTree = JSON.parse(treesArray[treesArray.length - 1].jsonStr);
      initialState.notesTree = notesTree;
      // TODO: adjust activeNode to where user left off
      initialState.activeNode = {
        id: notesTree[0].id,
        path: [notesTree[0].id],
      };
    }
    // TODO: replace hardcoded noteId value
    const noteId = '45745c60-7b1a-11e8-9c9c-2d42b21b1a3e';
    return editorContentStorage.loadEditorContent({ id: noteId });
  })
  .then(editorContent => {
    if (editorContent && 'body' in editorContent && 'delta' in editorContent) {
      initialState.editorContent = {
        content: editorContent.body,
        delta: new Delta(JSON.parse(editorContent.delta)),
      };
    }
  })
  .catch(error => window.alert(`No saved data loaded. ${error.message}`))
  .finally(() => render({ initialState }));
