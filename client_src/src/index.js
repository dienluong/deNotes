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

// TODO To adjust
const userId = process.env.REACT_APP_USER_ID;
const myTreeObserver = treeObserver(userId);

const store = createStore(rootReducer);
const notesTree$ = Observable.from(store).pluck('notesTree').auditTime(3000);
notesTree$.subscribe(myTreeObserver);

ReactDOM.render(<Provider store={ store }><App /></Provider>, document.getElementById('root'));
registerServiceWorker();
