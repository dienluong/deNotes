import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { NONE_SELECTED } from './utils/appCONSTANTS';
import { find } from 'react-sortable-tree';
import { getNodeKey } from './utils/treeUtils';
import registerServiceWorker from './registerServiceWorker';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import rootReducer, { selectNotesTreeTree } from './redux/reducers';
import { use as notesListActionsInject, fetchNotesTreeThunkAction, selectNodeThunkAction } from './redux/actions/notesListActions';
import { use as editorActionsInject } from './redux/actions/editorActions';
import { setUserAction } from './redux/actions/accountActions';
import notesListActionTypes from './redux/actions/constants/notesListActionConstants';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/auditTime';
import notesTreeObserver from './reactive/notesTreeObserver';
import * as editorContentObserver from './reactive/editorContentObserver';
import * as notesTreeStorage from './utils/notesTreeStorage';
import * as editorContentStorage from './utils/editorContentStorage';
// import { save as loopbackSave, load as loopbackLoad, remove as loopbackDelete } from './utils/loopbackREST';
import { save as saveToStorage, load as loadFromStorage, remove as deleteFromStorage } from './utils/offlineStorage';

const userId = process.env.REACT_APP_USER_ID;
// TODO: replace hardcoded value
// const noteId = '218013d0-ad79-11e8-bfc8-79a6754f355a';
const activeId = 'item|^|218013d0-ad79-11e8-bfc8-79a6754f355a';
// TODO: Restrict Devtools in dev-only?
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));

notesTreeStorage.inject({ save: saveToStorage, load: loadFromStorage });
editorContentStorage.inject({ save: saveToStorage, load: loadFromStorage, remove: deleteFromStorage });

// Create observer for saving notes tree
const myNotesTreeObserver = notesTreeObserver({ user: userId, storage: notesTreeStorage });

// Inject dependencies into notesListActions
// We are using the observers (instead of the storage's save()) as the save functions to make use of their extra logics
notesListActionsInject({
  notesTreeStorage: {
    save: myNotesTreeObserver,
    load: notesTreeStorage.load,
  },
  editorContentStorage: {
    save: editorContentObserver.save,
    load: editorContentStorage.load,
    remove: editorContentStorage.remove,
  },
});

// Inject dependencies into editorActions
editorActionsInject({
  editorContentStorage: {
    save: editorContentObserver.save,
    load: editorContentStorage.load,
    remove: editorContentStorage.remove,
  },
});

// TODO: adjust user ID to logged in user
store.dispatch(setUserAction({ user: { id: userId } }));

// Fetch asynchronously
store.dispatch(fetchNotesTreeThunkAction())
  .then((action) => {
    if (action.type !== notesListActionTypes.FETCH_NOTES_TREE_SUCCESS) {
      return;
    }
    // TODO: Node selected should be from last session, not hardcoded.
    const tree = selectNotesTreeTree(store.getState());
    // Once tree loaded, select a node.
    const matches = find({
      getNodeKey,
      treeData: tree,
      searchQuery: activeId,
      searchMethod: ({ node, searchQuery }) => searchQuery === node.id,
    }).matches;

    if (matches.length) {
      store.dispatch(selectNodeThunkAction({ id: activeId, path: matches[0].path }));
    }
    else {
      if (tree.length) {
        const matches = find({
          getNodeKey,
          treeData: tree,
          searchQuery: tree[0].id,
          searchMethod: ({ node, searchQuery }) => searchQuery === node.id,
        }).matches;

        store.dispatch(selectNodeThunkAction({ id: tree[0].id, path: matches[0].path }));
      } else {
        store.dispatch(selectNodeThunkAction({ id: NONE_SELECTED, path: [NONE_SELECTED] }));
      }
    }
  })
  .catch(err => window.alert(err.message));
// store.dispatch(fetchEditorContentThunkAction({ noteId }))
//   .catch(err => window.alert(err.message));

// Build Reactive Parts
const notesTree$ = Observable.from(store).pluck('notesTree').auditTime(1000);
const editorContent$ = Observable.from(store).pluck('editorContent').auditTime(1000);
// const myEditorContentObserver = editorContentObserver({ user: userId, storage: editorContentStorage });
editorContentObserver.inject({ user: userId, storage: editorContentStorage });
notesTree$.subscribe(myNotesTreeObserver);
editorContent$.subscribe(editorContentObserver.save);

ReactDOM.render(<Provider store={ store }><App /></Provider>, document.getElementById('root'));
registerServiceWorker();
