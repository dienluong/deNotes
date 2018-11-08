import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { render } from 'react-testing-library';
import rootReducer from '../redux/reducers';
jest.mock('../redux/actions/notesListActions');
import {
  selectNodeThunkAction,
  navigatePathAction,
  changeNotesTreeAction,
  changeNodeTitleAction,
  deleteNodeThunkAction,
  addAndSelectNodeThunkAction,
} from '../redux/actions/notesListActions';
import NotesListContainer from './NotesListContainer';

it('render correctly', () => {
  const store = createStore(rootReducer, compose(applyMiddleware(thunk)));
  render(<Provider store={ store }><NotesListContainer /></Provider>);
});
