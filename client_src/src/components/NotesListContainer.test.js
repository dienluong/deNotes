import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { render } from 'react-testing-library';
import 'jest-dom/extend-expect';
import rootReducer from '../redux/reducers';
import NotesListContainer from './NotesListContainer';
import defaultState from '../redux/misc/initialState';
import { mockedTree } from '../test-utils/mocks/mockedNotesTree';
import toolbarStyles from './widgets/Toolbar.module.css';
import toolStyles from './widgets/Tool.module.css';
import pathNavStyles from './widgets/PathNavigator.module.css';
import notesListStyles from './widgets/NotesList.module.css';
import nodeTitleStyles from './widgets/NodeTitle.module.css';

it('render correctly', () => {
  const mockedNotesTree = { id: '1234', tree: mockedTree, dateCreated: 1111, dateModified: 2222 };
  const store = createStore(rootReducer, { ...defaultState, notesTree: mockedNotesTree }, compose(applyMiddleware(thunk)));
  const { container } = render(<Provider store={ store }><NotesListContainer /></Provider>);
  expect(container).toMatchSnapshot();
  expect(container).toBeVisible();
  container.querySelectorAll(`.${toolbarStyles.dnt__toolbar}`).forEach(toolbar => expect(toolbar).toBeVisible());
  container.querySelectorAll(`.${toolStyles.dnt__tool}`).forEach(tool => expect(tool).toBeVisible());
  container.querySelectorAll(`.${pathNavStyles.dnt__pathnav}`).forEach(nav => expect(nav).toBeVisible());
  container.querySelectorAll(`.${pathNavStyles['dnt__pathnav-segment']}`).forEach(segment => expect(segment).toBeVisible());
  container.querySelectorAll(`.${pathNavStyles['dnt__pathnav-segment--active']}`).forEach(segment => expect(segment).toBeVisible());
  container.querySelectorAll(`.${notesListStyles.dnt__tree}`).forEach(tree => expect(tree).toBeVisible());
  container.querySelectorAll(`.${notesListStyles['dnt__tree-node']}`).forEach(node => expect(node).toBeVisible());
  container.querySelectorAll(`.${notesListStyles['dnt__tree-node-btn']}`).forEach(button => expect(button).toBeVisible());
  container.querySelectorAll(`.${nodeTitleStyles['dnt__node-title']}`).forEach(title => expect(title).toBeVisible());
});