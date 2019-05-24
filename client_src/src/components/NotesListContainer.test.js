import React from 'react';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import 'jest-dom/extend-expect';
import NotesListContainer, { DEFAULT_ROOT_FOLDER_NAME } from './NotesListContainer';
import NotesListDrawer from './widgets/NotesListDrawer';
import initialState from '../redux/misc/initialState';
import { mockedTree } from '../test-utils/mocks/mockedNotesTree';
import { getNodeKey } from '../utils/treeUtils';
import { createSerializer } from 'enzyme-to-json';

// Configure Enzyme
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });
let wrapper = {};

// Configure snapshot serializer
expect.addSnapshotSerializer(createSerializer());

afterEach(() => {
  if (typeof wrapper.unmount === 'function') {
    wrapper.unmount();
  }
});

it('renders NotesListDrawer correctly with prop values taken from redux store, including merge props', () => {
  const mockedNotesTree = {
    id: '1234',
    tree: mockedTree,
    dateCreated: 1111,
    dateModified: 2222,
  };
  let mockedInitialState = {
    ...initialState,
    notesTree: mockedNotesTree,
    activeNode: {
      id: mockedNotesTree.tree[0].id,
      path: [mockedNotesTree.tree[0].id],
    },
  };
  let store = createMockStore([thunk])(mockedInitialState);

  // ---> test case where active folder is not root
  let expectedProps = {
    tree: mockedNotesTree.tree[0].children,
    activeNode: { ...mockedInitialState.activeNode },
    rootViewOn: false,
    currentFolderName: mockedTree[0].title,
    treeChangeHandler: expect.any(Function),
    nodeTitleChangeHandler: expect.any(Function),
    nodeClickHandler: expect.any(Function),
    nodeDoubleClickHandler: expect.any(Function),
    deleteNodeBtnHandler: expect.any(Function),
    backBtnHandler: expect.any(Function),
    homeBtnHandler: expect.any(Function),
    toolbarHandlers: expect.any(Array),
  };

  const expectedMergeProps = {
    dummyProp: 'dummy',
    getNodeKey,
  };

  wrapper = shallow(<Provider store={ store }><NotesListContainer dummyProp={ expectedMergeProps.dummyProp } /></Provider>)
    .dive({ context: { store } });
  expect(wrapper).toMatchSnapshot();

  expect(wrapper.find(NotesListDrawer).exists()).toBe(true);
  expect(wrapper.find(NotesListDrawer).props()).toMatchObject({ ...expectedProps, ...expectedMergeProps });

  if (typeof wrapper.unmount === 'function') {
    wrapper.unmount();
  }

  // ---> test case where active folder is root
  // Note: In the case below, the active node is an ITEM node (as opposed to a FOLDER) of the root, so the active folder is root itself.
  mockedInitialState = {
    ...initialState,
    notesTree: mockedNotesTree,
    activeNode: {
      id: mockedNotesTree.tree[1].id,
      path: [mockedNotesTree.tree[1].id],
    },
  };
  store = createMockStore([thunk])(mockedInitialState);

  expectedProps = {
    tree: mockedNotesTree.tree,
    activeNode: { ...mockedInitialState.activeNode },
    rootViewOn: true,
    currentFolderName: DEFAULT_ROOT_FOLDER_NAME,
    getNodeKey,
  };

  wrapper = shallow(<Provider store={ store }><NotesListContainer dummyProp={ expectedMergeProps.dummyProp }/></Provider>)
    .dive({ context: { store } });
  expect(wrapper.find(NotesListDrawer).exists()).toBe(true);
  expect(wrapper.find(NotesListDrawer).props()).toMatchObject({ ...expectedProps, ...expectedMergeProps });
});

/*
it('reacts to events by calling proper action creator', () => {
  const mockedNotesTree = { id: '1234', tree: mockedTree, dateCreated: 1111, dateModified: 2222 };
  const mockedInitialState = {
    ...initialState,
    notesTree: mockedNotesTree,
    activeNode: {
      id: mockedNotesTree.tree[0].id,
      path: [mockedNotesTree.tree[0].id],
    },
  };
  selectNodeThunkAction.mockImplementation(() => ({ type: 'DUMMY_ACTION', payload: 'DUMMY_PAYLOAD' }));
  goToRootAction.mockImplementation(() => ({ type: 'DUMMY_ACTION', payload: 'DUMMY_PAYLOAD' }));
  goUpAFolderAction.mockImplementation(() => ({ type: 'DUMMY_ACTION', payload: 'DUMMY_PAYLOAD' }));
  changeNodeTitleAction.mockImplementation(() => ({ type: 'DUMMY_ACTION', payload: 'DUMMY_PAYLOAD' }));
  deleteNodeThunkAction.mockImplementation(() => ({ type: 'DUMMY_ACTION', payload: 'DUMMY_PAYLOAD' }));
  addAndSelectNodeThunkAction.mockImplementation(() => ({ type: 'DUMMY_ACTION', payload: 'DUMMY_PAYLOAD' }));

  const store = createMockStore([thunk])(mockedInitialState);
  // const store = createStore((state) => state, mockedInitialState, applyMiddleware(thunk));

  wrapper = shallow(<Provider store={ store }><NotesListContainer /></Provider>);

  // Test toolbar clicks
  let target = wrapper.find();
  // wrapper.find(`.${toolStyles.dnt__tool}[children="New Folder"]`).simulate('click');
  expect(target).toHaveLength(1);
  fireEvent.click(target[0]);
  expect(addAndSelectNodeThunkAction).toBeCalledTimes(1);

  target = queryAllByText(TOOLBAR_LABELS.NEW_NOTE);
  expect(target).toHaveLength(1);
  fireEvent.click(target[0]);
  expect(addAndSelectNodeThunkAction).toBeCalledTimes(2);
  addAndSelectNodeThunkAction.mockClear();

  target = queryAllByText(TOOLBAR_LABELS.BACK_BUTTON);
  expect(target).toHaveLength(1);
  fireEvent.click(target[0]);
  expect(goToRootAction).toBeCalledTimes(1);
  goToRootAction.mockClear();

  // Test navbar click
  target = container.querySelectorAll(`.${pathNavStyles["dnt__pathnav-segment--active"]}`);
  expect(target).toHaveLength(1);
  fireEvent.click(target[0]);
  expect(navigatePathThunkAction).toBeCalledTimes(1);

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
*/
