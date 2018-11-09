import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { render, prettyDOM } from 'react-testing-library';
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

import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });
let wrapper;

afterEach(() => {
  if (typeof wrapper.unmount === 'function') { wrapper.unmount(); }
});

it('render correctly', () => {
  const mockedNotesTree = { id: '1234', tree: mockedTree, dateCreated: 1111, dateModified: 2222 };
  const store = createStore(rootReducer, { ...defaultState, notesTree: mockedNotesTree }, compose(applyMiddleware(thunk)));
  const { container } = render(<Provider store={ store }><NotesListContainer /></Provider>);

  wrapper = shallow(<Provider store={ store }><div><NotesListContainer /></div></Provider>);

  expect(container).toMatchSnapshot();
});
