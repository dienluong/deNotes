import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './redux/reducers';
import { fetchNotesTreeAction } from './redux/actions/notesListActions';
import { fetchEditorContentAction } from './redux/actions/editorActions';
import { Provider } from 'react-redux';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/auditTime';
import notesTreeObserver from './reactive/notesTreeObserver';
import editorContentObserver from './reactive/editorContentObserver';
import * as notesTreeStorage from './utils/notesTreeStorage';
import * as editorContentStorage from './utils/editorContentStorage';
import { save as loopbackSave, load as loopbackLoad } from './utils/loopbackREST';

// TODO: adjust user ID to logged in user
const userId = process.env.REACT_APP_USER_ID;
// TODO: replace hardcoded noteId value
const noteId = '218013d0-ad79-11e8-bfc8-79a6754f355a';

// Use loopbackREST for loading and saving persisted data
notesTreeStorage.inject({ save: loopbackSave, load: loopbackLoad });
editorContentStorage.inject({ save: loopbackSave, load: loopbackLoad });
const store = createStore(rootReducer, applyMiddleware(thunk));
// Fetch asynchronously
store.dispatch(fetchNotesTreeAction({ userId }))
  .catch(err => window.alert(err.message));
store.dispatch(fetchEditorContentAction({ noteId }))
  .catch(err => window.alert(err.message));

// Build Reactive Parts
const notesTree$ = Observable.from(store).pluck('notesTree').auditTime(3000);
const editorContent$ = Observable.from(store).pluck('editorContent').auditTime(3000);
const myNotesTreeObserver = notesTreeObserver({ user: userId, storage: notesTreeStorage });
const myEditorContentObserver = editorContentObserver({ user: userId, storage: editorContentStorage });
notesTree$.subscribe(myNotesTreeObserver);
editorContent$.subscribe(myEditorContentObserver);

ReactDOM.render(<Provider store={ store }><App /></Provider>, document.getElementById('root'));
registerServiceWorker();

/*
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
*/
