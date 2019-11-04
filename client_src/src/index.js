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
import * as notesTreeDataStore from './utils/notesTreeDataStore';
import * as editorContentDataStore from './utils/editorContentDataStore';
// import { save as loopbackSave, load as loopbackLoad, remove as loopbackDelete } from './utils/loopbackREST';
import localStorage from './utils/offlineStorage';
import { connect } from './utils/cloudStorage';

const userId = process.env.REACT_APP_USER_ID;
const activeId = 'item|^|218013d0-ad79-11e8-bfc8-79a6754f355a';
// TODO: Restrict Devtools in dev-only?
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));

notesTreeDataStore.inject({ save: localStorage.save, load: localStorage.load });
editorContentDataStore.inject({ save: localStorage.save, load: localStorage.load, remove: localStorage.remove });

// Preparing observers
const myNotesTreeObserver = notesTreeObserver({ user: userId, storage: notesTreeDataStore });
// const myEditorContentObserver = editorContentObserver({ user: userId, storage: editorContentDataStore });
editorContentObserver.inject({ user: userId, storage: editorContentDataStore });

// Inject dependencies into notesListActions
// Using the observers' save function (instead of the storage's save function directly) to make use of its extra logic
notesListActionsInject({
  notesTreeStorage: {
    save: myNotesTreeObserver,
    load: notesTreeDataStore.load,
  },
  editorContentStorage: {
    save: editorContentObserver.save,
    load: editorContentDataStore.load,
    remove: editorContentDataStore.remove,
  },
});

// Inject dependencies into editorActions
editorActionsInject({
  editorContentStorage: {
    save: editorContentObserver.save,
    load: editorContentDataStore.load,
    remove: editorContentDataStore.remove,
  },
});

// TODO: adjust user ID to logged in user
store.dispatch(setUserAction({ user: { id: userId } }));

const remoteStorage = connect({ storage: localStorage.storage });
remoteStorage.widget.attach('widget');
// Fetch asynchronously
remoteStorage.storage.on('sync-done', function onSyncDone() {
  store.dispatch(fetchNotesTreeThunkAction())
    .then((action) => {
      if (action.type !== notesListActionTypes.FETCH_NOTES_TREE_SUCCESS) {
        return;
      }
      // TODO: Node selected should be from last session, not hardcoded.
      const tree = selectNotesTreeTree(store.getState());
      // TODO: remove
      console.log('TREE------->', tree);
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

  remoteStorage.storage.off('sync-done', onSyncDone);
});

// Build Reactive Parts
const notesTree$ = Observable.from(store).pluck('notesTree').auditTime(1000);
const editorContent$ = Observable.from(store).pluck('editorContent').auditTime(1000);
notesTree$.subscribe(myNotesTreeObserver);
editorContent$.subscribe(editorContentObserver.save);

ReactDOM.render(<Provider store={ store }><App /></Provider>, document.getElementById('root'));
registerServiceWorker();
