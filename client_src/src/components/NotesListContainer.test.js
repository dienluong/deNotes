import React from 'react';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { render, prettyDOM } from 'react-testing-library';
import 'jest-dom/extend-expect';
import NotesListContainer from './NotesListContainer';
import NotesList from './widgets/NotesList';
import initialState from '../redux/misc/initialState';
import { mockedTree } from '../test-utils/mocks/mockedNotesTree';
jest.mock('../redux/actions/notesListActions');
import {
  selectNodeThunkAction,
  navigatePathAction,
  changeNotesTreeAction,
  changeNodeTitleAction,
  deleteNodeThunkAction,
  addAndSelectNodeThunkAction,
} from '../redux/actions/notesListActions';

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

it('render correctly with props with values taken from redux store', () => {
  const mockedNotesTree = { id: '1234', tree: mockedTree, dateCreated: 1111, dateModified: 2222 };
  const mockedInitialState = {
    ...initialState,
    notesTree: mockedNotesTree,
    activeNode: {
      id: mockedNotesTree.tree[0].id,
      path: [mockedNotesTree.tree[0].id],
    },
  };
  const expectedProps = {
    tree: [...mockedNotesTree.tree],
    activeNode: { ...mockedInitialState.activeNode },
    activePath: [mockedNotesTree.tree[0].title],
  };
  const store = createMockStore([thunk])(mockedInitialState);
  const { container } = render(<Provider store={ store }><NotesListContainer /></Provider>);
  expect(container).toMatchSnapshot();

  wrapper = shallow(<Provider store={ store }><NotesListContainer /></Provider>).dive({ context: { store } });

  // console.log('\n\n\n');
  // console.log(wrapper.debug());
  // console.log(wrapper.props());
  // console.log('\n\n\n\n\n\n\n\n');

  expect(wrapper.find(NotesList).exists()).toBe(true);
  expect(wrapper.find(NotesList).props()).toMatchObject(expectedProps);
});
