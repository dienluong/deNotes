import React from 'react';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { render, cleanup, fireEvent } from 'react-testing-library';
import 'jest-dom/extend-expect';
import NotesListContainer, { TOOLBAR_LABELS } from './NotesListContainer';
import NotesList from './widgets/NotesList';
import initialState from '../redux/misc/initialState';
import { mockedTree } from '../test-utils/mocks/mockedNotesTree';
import { getNodeKey } from '../utils/treeUtils';
jest.mock('../redux/actions/notesListActions');
import {
  selectNodeThunkAction,
  navigatePathAction,
  changeNotesTreeAction,
  changeNodeTitleAction,
  deleteNodeThunkAction,
  addAndSelectNodeThunkAction,
} from '../redux/actions/notesListActions';

import pathNavStyles from './widgets/PathNavigator.module.css';
import notesListStyles from './widgets/NotesList.module.css';
import nodeTitleStyles from './widgets/NodeTitle.module.css';

// Configure Enzyme
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });
let wrapper = {};

afterEach(() => {
  if (typeof wrapper.unmount === 'function') {
    wrapper.unmount();
  }
  cleanup();
  addAndSelectNodeThunkAction.mockClear();
  navigatePathAction.mockClear();
  selectNodeThunkAction.mockClear();
  changeNodeTitleAction.mockClear();
  deleteNodeThunkAction.mockClear();
  changeNotesTreeAction.mockClear();
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
    getNodeKey,
  };
  const store = createMockStore([thunk])(mockedInitialState);
  const { container } = render(<Provider store={ store }><NotesListContainer /></Provider>);
  expect(container).toMatchSnapshot();

  wrapper = shallow(<Provider store={ store }><NotesListContainer /></Provider>).dive({ context: { store } });

  expect(wrapper.find(NotesList).exists()).toBe(true);
  expect(wrapper.find(NotesList).props()).toMatchObject(expectedProps);
});

it('react to events by calling proper handlers', () => {
  const mockedNotesTree = { id: '1234', tree: mockedTree, dateCreated: 1111, dateModified: 2222 };
  const mockedInitialState = {
    ...initialState,
    notesTree: mockedNotesTree,
    activeNode: {
      id: mockedNotesTree.tree[0].id,
      path: [mockedNotesTree.tree[0].id],
    },
  };
  addAndSelectNodeThunkAction.mockImplementation(() => ({ type: 'DUMMY_ACTION', payload: 'DUMMY_PAYLOAD' }));
  navigatePathAction.mockImplementation(() => ({ type: 'DUMMY_ACTION', payload: 'DUMMY_PAYLOAD' }));
  selectNodeThunkAction.mockImplementation(() => ({ type: 'DUMMY_ACTION', payload: 'DUMMY_PAYLOAD' }));
  changeNodeTitleAction.mockImplementation(() => ({ type: 'DUMMY_ACTION', payload: 'DUMMY_PAYLOAD' }));
  deleteNodeThunkAction.mockImplementation(() => ({ type: 'DUMMY_ACTION', payload: 'DUMMY_PAYLOAD' }));

  const store = createMockStore([thunk])(mockedInitialState);
  // const store = createStore((state) => state, mockedInitialState, applyMiddleware(thunk));

  const { queryAllByText, container } = render(<Provider store={ store }><NotesListContainer /></Provider>);

  // Test toolbar clicks
  let target = queryAllByText(TOOLBAR_LABELS.NEW_FOLDER);
  // wrapper.find(`.${toolStyles.dnt__tool}[children="New Folder"]`).simulate('click');
  expect(target).toHaveLength(1);
  fireEvent.click(target[0]);
  expect(addAndSelectNodeThunkAction).toBeCalledTimes(1);

  target = queryAllByText(TOOLBAR_LABELS.NEW_NOTE);
  expect(target).toHaveLength(1);
  fireEvent.click(target[0]);
  expect(addAndSelectNodeThunkAction).toBeCalledTimes(2);
  addAndSelectNodeThunkAction.mockClear();

  // Test navbar click
  target = container.querySelectorAll(`.${pathNavStyles["dnt__pathnav-segment--active"]}`);
  expect(target).toHaveLength(1);
  fireEvent.click(target[0]);
  expect(navigatePathAction).toBeCalledTimes(1);

  // Test node click
  target = container.querySelectorAll(`.${notesListStyles["dnt__tree-node"]}`);
  // our choosen mocked tree has more than one node
  expect(target.length).toBeGreaterThan(1);
  // arbitrarily click on second node
  fireEvent.click(target[1]);
  expect(selectNodeThunkAction).toBeCalledTimes(1);

  // Test title change on blur
  target = container.querySelectorAll(`.${nodeTitleStyles["dnt__node-title"]}`);
  expect(target.length).toBeGreaterThan(1);
  // change the title of the second node
  target[1].value = 'changed title';
  fireEvent.blur(target[1]);
  expect(changeNodeTitleAction).toBeCalledTimes(1);

  // Test node button '+' click
  target = queryAllByText('+');
  // our mocked tree has more than one node
  expect(target.length).toBeGreaterThan(1);
  // just arbitrarily choose to click on '+' button of the second node
  fireEvent.click(target[1]);
  expect(addAndSelectNodeThunkAction).toBeCalledTimes(1);

  // Test node button 'x' click
  target = queryAllByText('x');
  // our mocked tree has more than one node
  expect(target.length).toBeGreaterThan(1);
  // just arbitrarily choose to click on '+' button of the second node
  fireEvent.click(target[1]);
  expect(deleteNodeThunkAction).toBeCalledTimes(1);
});
