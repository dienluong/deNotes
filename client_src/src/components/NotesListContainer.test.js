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
import defaultState from '../redux/misc/initialState';
import { mockedTree } from '../test-utils/mocks/mockedNotesTree';

it('render correctly', () => {
  const mockedNotesTree = { id: '1234', tree: mockedTree, dateCreated: 1111, dateModified: 2222 };
  const store = createStore(rootReducer, { ...defaultState, notesTree: mockedNotesTree }, compose(applyMiddleware(thunk)));
  const { container } = render(<Provider store={ store }><NotesListContainer /></Provider>);
  expect(container).toMatchSnapshot();
});
