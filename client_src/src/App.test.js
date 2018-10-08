import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import initialState from './redux/misc/initialState';
import App from './App';

it('renders without crashing', () => {
  const store = createStore(() => initialState);
  const div = document.createElement('div');
  ReactDOM.render(<Provider store={ store }><App /></Provider>, div);
  ReactDOM.unmountComponentAtNode(div);
});
