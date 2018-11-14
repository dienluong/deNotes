import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import initialState from './redux/misc/initialState';
import App from './App';
import { MutationObserver } from './test-utils/MutationObserver';

beforeAll(() => {
  // Required for rendering Quill editor
  global.MutationObserver = MutationObserver;
  document.getSelection = function() {
    return {
      getRangeAt: () => {},
    };
  };
});

it('renders without crashing', () => {
  const store = createStore(() => initialState);
  const div = document.createElement('div');
  ReactDOM.render(<Provider store={ store }><App /></Provider>, div);
  ReactDOM.unmountComponentAtNode(div);
});
