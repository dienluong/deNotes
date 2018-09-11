import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { find } from 'react-sortable-tree';
import { getNodeKey } from './utils/treeUtils';
import registerServiceWorker from './registerServiceWorker';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './redux/reducers';
import { fetchNotesTreeThunkAction } from './redux/actions/notesListActions';
// import { fetchEditorContentThunkAction } from './redux/actions/editorActions';
import { selectNodeThunkAction } from './redux/actions/notesListActions';
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
// TODO: replace hardcoded value
// const noteId = '218013d0-ad79-11e8-bfc8-79a6754f355a';
const activeId = 'item|^|218013d0-ad79-11e8-bfc8-79a6754f355a';
// const activePath = [
//   'folder|^|a3c41eb0-a7d2-11e8-a12b-99205b853de7',
//   'folder|^|a9914200-a7d2-11e8-a12b-99205b853de7',
//   'folder|^|3e2cd9f0-aa81-11e8-bd46-299e5e4dd9fb',
//   'item|^|218013d0-ad79-11e8-bfc8-79a6754f355a'];

// Use loopbackREST for loading and saving persisted data
notesTreeStorage.inject({ save: loopbackSave, load: loopbackLoad });
editorContentStorage.inject({ save: loopbackSave, load: loopbackLoad });
const store = createStore(rootReducer, applyMiddleware(thunk));

// Fetch asynchronously
store.dispatch(fetchNotesTreeThunkAction({ userId }))
  .then(() => {
    const path = find({
      getNodeKey,
      treeData: store.getState().notesTree,
      searchQuery: activeId,
      searchMethod: ({ node, searchQuery }) => searchQuery === node.id,
    }).matches[0].path;
    store.dispatch(selectNodeThunkAction({ id: activeId, path }));
  })
  .catch(err => window.alert(err.message));
// store.dispatch(fetchEditorContentThunkAction({ noteId }))
//   .catch(err => window.alert(err.message));

// Build Reactive Parts
const notesTree$ = Observable.from(store).pluck('notesTree').auditTime(1000);
const editorContent$ = Observable.from(store).pluck('editorContent').auditTime(1000);
const myNotesTreeObserver = notesTreeObserver({ user: userId, storage: notesTreeStorage });
const myEditorContentObserver = editorContentObserver({ user: userId, storage: editorContentStorage });
notesTree$.subscribe(myNotesTreeObserver);
editorContent$.subscribe(myEditorContentObserver);

ReactDOM.render(<Provider store={ store }><App /></Provider>, document.getElementById('root'));
registerServiceWorker();
