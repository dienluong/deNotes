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
  window.matchMedia = jest.fn().mockImplementation(query => {
    return {
      matches: true,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    };
  });
});

it.skip('renders without crashing', () => {
  const store = createStore(() => initialState);
  const div = document.createElement('div');
  ReactDOM.render(<Provider store={ store }><App /></Provider>, div);
  ReactDOM.unmountComponentAtNode(div);
});
