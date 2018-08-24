import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { createStore } from 'redux';
import rootReducer from './redux/reducers';
import { Provider } from 'react-redux';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/auditTime';
import treeObserver from './utils/treeObserver';
import { inject, loadTree } from './utils/treeStorage';
import { save, load } from './utils/loopbackREST';

// Use loopbackREST for loading and saving persisted data
inject({ save, load });

// TODO: adjust user ID to logged in user
const userId = process.env.REACT_APP_USER_ID;

function render({ initialState = null }) {
  let store = null;
  if (initialState) {
    store = createStore(rootReducer, initialState);
  } else {
    store = createStore(rootReducer);
  }
  const notesTree$ = Observable.from(store).pluck('notesTree').auditTime(3000);
  const myTreeObserver = treeObserver(userId);
  notesTree$.subscribe(myTreeObserver);

  ReactDOM.render(<Provider store={ store }><App /></Provider>, document.getElementById('root'));
  registerServiceWorker();
}

loadTree(userId)
  .then(treesArray => {
    // In the unexpected case where there are more than one tree for the same user, use the last one.
    const notesTree = JSON.parse(treesArray[treesArray.length - 1].jsonStr);
    const initialState = {
      notesTree,
      // TODO: adjust activeNode to where user left off
      activeNode: {
        id: notesTree[0].id,
        path: [notesTree[0].id],
      },
    };
    render({ initialState });
  })
  .catch(error => {
    window.alert(`No saved tree loaded. ${error.message}`);
    render({});
  });
