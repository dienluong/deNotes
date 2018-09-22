import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { find } from 'react-sortable-tree';
import { getNodeKey } from './utils/treeUtils';
import registerServiceWorker from './registerServiceWorker';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import rootReducer, { selectNotesTreeTree } from './redux/reducers';
import { fetchNotesTreeThunkAction, selectNodeThunkAction } from './redux/actions/notesListActions';
import notesListActionTypes from './redux/actions/constants/notesListActionConstants';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/auditTime';
import notesTreeObserver from './reactive/notesTreeObserver';
import * as editorContentObserver from './reactive/editorContentObserver';
import * as notesTreeStorage from './utils/notesTreeStorage';
import * as editorContentStorage from './utils/editorContentStorage';
import { save as loopbackSave, load as loopbackLoad, remove as loopbackDelete } from './utils/loopbackREST';

// TODO: adjust user ID to logged in user
const userId = process.env.REACT_APP_USER_ID;
// TODO: replace hardcoded value
// const noteId = '218013d0-ad79-11e8-bfc8-79a6754f355a';
const activeId = 'item|^|218013d0-ad79-11e8-bfc8-79a6754f355a';

// Use loopbackREST for loading and saving persisted data
notesTreeStorage.inject({ save: loopbackSave, load: loopbackLoad });
editorContentStorage.inject({ save: loopbackSave, load: loopbackLoad, remove: loopbackDelete });

// TODO: Restrict Devtools in dev-only?
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));

// Fetch asynchronously
store.dispatch(fetchNotesTreeThunkAction({ userId }))
  .then((action) => {
    if (action.type !== notesListActionTypes.FETCH_NOTES_TREE_SUCCESS) {
      return;
    }
    // TODO: Node selected should be from last session, not hardcoded.
    const notesTree = selectNotesTreeTree(store.getState());
    // Once tree loaded, select a node.
    const matches = find({
      getNodeKey,
      treeData: notesTree,
      searchQuery: activeId,
      searchMethod: ({ node, searchQuery }) => searchQuery === node.id,
    }).matches;

    if (matches.length) {
      store.dispatch(selectNodeThunkAction({ id: activeId, path: matches[0].path }));
    }
    else {
      const defaultNodeId = notesTree[0].id;
      store.dispatch(selectNodeThunkAction({ id: defaultNodeId, path: [defaultNodeId] }));
    }
  })
  .catch(err => window.alert(err.message));
// store.dispatch(fetchEditorContentThunkAction({ noteId }))
//   .catch(err => window.alert(err.message));

// Build Reactive Parts
const notesTree$ = Observable.from(store).pluck('notesTree').auditTime(1000);
const editorContent$ = Observable.from(store).pluck('editorContent').auditTime(1000);
const myNotesTreeObserver = notesTreeObserver({ user: userId, storage: notesTreeStorage });
// const myEditorContentObserver = editorContentObserver({ user: userId, storage: editorContentStorage });
editorContentObserver.inject({ user: userId, storage: editorContentStorage });
notesTree$.subscribe(myNotesTreeObserver);
editorContent$.subscribe(editorContentObserver.save);

ReactDOM.render(<Provider store={ store }><App /></Provider>, document.getElementById('root'));
registerServiceWorker();
