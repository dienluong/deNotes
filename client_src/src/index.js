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
import { loadTree } from './utils/treeStorage';

// TODO: adjust user ID
// TODO: adjust activeNode
const userId = process.env.REACT_APP_USER_ID;
loadTree(userId).then(treesArray => {
  // In the unexpected case where there are more than one tree for the same user, use the last one.
  const notesTree = JSON.parse(treesArray[treesArray.length - 1].jsonStr);
  const initialState = {
    notesTree,
    activeNode: {
      id: notesTree[0].id,
      path: [notesTree[0].id],
    },
  };
  const store = createStore(rootReducer, initialState);
  const notesTree$ = Observable.from(store).pluck('notesTree').auditTime(3000);
  const myTreeObserver = treeObserver(userId);
  notesTree$.subscribe(myTreeObserver);

  ReactDOM.render(<Provider store={ store }><App /></Provider>, document.getElementById('root'));
  registerServiceWorker();
});
