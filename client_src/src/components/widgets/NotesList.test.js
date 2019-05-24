import React from 'react';
import NotesList from './NotesList';
import notesListStyles from './NotesList.module.css';
import pathNavStyles from './PathNavigator.module.css';
import AppBar from '@material-ui/core/AppBar';
import MuiToolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import HomeIcon from '@material-ui/icons/Home';
import NewFolderIcon from '@material-ui/icons/CreateNewFolder';
import NewNoteIcon from '@material-ui/icons/NoteAdd';
import GoOutFolderIcon from '@material-ui/icons/ArrowBackIos';
import GoInFolderIcon from '@material-ui/icons/ArrowForwardIos';
import Tree, { walk, find, getFlatDataFromTree } from 'react-sortable-tree';
import { getNodeKey } from '../../utils/treeUtils';
import { nodeTypes } from '../../utils/appCONSTANTS';
import baseState from '../../redux/misc/initialState';
import { selectTitlesFromActivePath } from '../../redux/selectors';
import { mockedTree } from '../../test-utils/mocks/mockedNotesTree';
import { render, cleanup, fireEvent, within } from 'react-testing-library';
import 'jest-dom/extend-expect';
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

  cleanup();
});

const toolbarHandlersMap = new Map();
const toolbarHandlersMap2 = new Map();
toolbarHandlersMap.set('tool1', jest.fn());
toolbarHandlersMap.set('tool2', jest.fn());
toolbarHandlersMap2.set('tool3', jest.fn());

it('should render header, tree and app bar properly in root-view mode', () => {
  const tree = mockedTree;
  // active node is an ITEM in root, so active folder is the root itself; thus, rootViewOn should be set to true
  const activeNode = {
    id: mockedTree[1].id,
    path: [mockedTree[1].id],
  };
  const props = {
    tree,
    size: 'small',
    activeNode,
    rootViewOn: true,
    currentFolderName: 'TEST FOLDER NAME',
    treeChangeHandler: jest.fn(),
    nodeTitleChangeHandler: jest.fn(),
    nodeClickHandler: jest.fn(),
    nodeDoubleClickHandler: jest.fn(),
    deleteNodeBtnHandler: jest.fn(),
    backBtnHandler: jest.fn(),
    homeBtnHandler: jest.fn(),
    toolbarHandlers: [jest.fn(), jest.fn()],
    getNodeKey,
  };

  const expectedTreeProps = {
    treeData: props.tree,
    onChange: props.treeChangeHandler,
    getNodeKey,
  };

  wrapper = shallow(<NotesList { ...props } />);
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.find(AppBar).filter('.dnt__notes-list-header').exists()).toBe(true);
  expect(wrapper.find('div.dnt__notes-list-appbar').exists()).toBe(true);
  const treeWrapper = wrapper.find(Tree);
  expect(treeWrapper.exists()).toBe(true);
  expect(treeWrapper.props()).toMatchObject(expectedTreeProps);
  expect(wrapper.find(Typography).render().text()).toEqual(props.currentFolderName);
  expect(wrapper.find(NewFolderIcon).exists()).toBe(true);
  expect(wrapper.find(NewNoteIcon).exists()).toBe(true);

  // Asserts root-view mode specifics
  expect(wrapper.find(MuiToolbar).filter('.dnt__notes-list-muitoolbar--root').exists()).toBe(true);
  expect(wrapper.find(GoOutFolderIcon).exists()).toBe(false);
  expect(wrapper.find(HomeIcon).exists()).toBe(false);
});

it('should render all node titles of the received tree and highlight the active node', () => {
  const tree = mockedTree;
  // active node is an ITEM in root, so active folder is the root itself
  const activeNode = {
    id: mockedTree[1].id,
    path: [mockedTree[1].id],
  };
  const activePath = selectTitlesFromActivePath({ ...baseState, notesTree: { ...baseState.notesTree, tree }, activeNode });
  const props = {
    tree,
    activeNode,
    activePath,
    treeChangeHandler: jest.fn(),
    nodeTitleChangeHandler: jest.fn(),
    nodeClickHandler: jest.fn(),
    deleteNodeBtnHandler: jest.fn(),
    addNoteBtnHandler: jest.fn(),
    pathNavigatorClickHandler: jest.fn(),
    toolbarHandlersMap,
    toolbarHandlersMap2,
    getNodeKey,
  };

  const { container, queryAllByValue } = render(<NotesList { ...props }/>);

  expect(container).toMatchSnapshot();
  const renderedInputs = Array.from(container.getElementsByTagName('input'));
  const renderedTitles = renderedInputs.map(input => input.value);

  const test = jest.fn();
  test.mockImplementation(({ node }) => {
    if (node.id === activeNode.id) {
      const highlightedNodes = container.getElementsByClassName(notesListStyles['dnt__tree-node--active']);
      // should expect only one highlighted node
      expect(highlightedNodes.length).toEqual(1);
      expect(highlightedNodes[0].querySelector('input').value).toEqual(node.title);
    }
    expect(queryAllByValue(node.title)).toHaveLength(1);
    expect(renderedTitles.includes(node.title)).toBe(true);
  });

  // For each node in the tree sent to NotesList component, run test.
  walk({
    treeData: props.tree,
    getNodeKey,
    callback: test,
    ignoreCollapsed: true,
  });

  // The current active folder (the root) has total of 9 children and grandchildren nodes
  expect(test).toBeCalledTimes(9);
  const numOfRenderedTreeNodeElements = container.getElementsByClassName(notesListStyles['dnt__tree-node']).length;
  const numOfNodesInSourceTree = getFlatDataFromTree({ treeData: props.tree, getNodeKey, ignoreCollapsed: true }).length;
  expect(numOfNodesInSourceTree).toEqual(numOfRenderedTreeNodeElements);
});

it('should invoke handler when tree node is clicked', () => {
  const tree = mockedTree;
  const activeNode = {
    id: mockedTree[1].id,
    path: [mockedTree[1].id],
  };
  const activePath = selectTitlesFromActivePath({ ...baseState, notesTree: { ...baseState.notesTree, tree }, activeNode });
  const props = {
    tree,
    activeNode,
    activePath,
    treeChangeHandler: jest.fn(),
    nodeTitleChangeHandler: jest.fn(),
    nodeClickHandler: jest.fn(),
    deleteNodeBtnHandler: jest.fn(),
    addNoteBtnHandler: jest.fn(),
    pathNavigatorClickHandler: jest.fn(),
    toolbarHandlersMap,
    toolbarHandlersMap2,
    getNodeKey,
  };

  const { container } = render(<NotesList { ...props }/>);

  const renderedTreeNodeElements = [...container.getElementsByClassName(notesListStyles['dnt__tree-node'])];
  renderedTreeNodeElements.forEach(element => {
    const elementTitle = element.getElementsByTagName('input')[0].value;
    const correspondingNode = find({
      treeData: props.tree,
      getNodeKey,
      searchQuery: elementTitle,
      searchMethod: ({ node, searchQuery }) => node.title === searchQuery,
    }).matches;
    // This assertion is NOT the actual test. For each rendered element, we should have one and only one corresponding node in the treeData.
    expect(correspondingNode).toHaveLength(1);

    fireEvent.click(element);
    // this assertion is the actual test
    expect(props.nodeClickHandler).lastCalledWith({ id: correspondingNode[0].node.id, path: correspondingNode[0].path });
  });

  const numOfNodesInSourceTree = getFlatDataFromTree({ treeData: props.tree, getNodeKey, ignoreCollapsed: true }).length;
  expect(props.nodeClickHandler).toBeCalledTimes(numOfNodesInSourceTree);
});

it('should invoke handler when double-click on node', () => {
  const tree = mockedTree;
  const activeNode = {
    id: mockedTree[1].id,
    path: [mockedTree[1].id],
  };
  const activePath = selectTitlesFromActivePath({ ...baseState, notesTree: { ...baseState.notesTree, tree }, activeNode });
  const props = {
    tree,
    activeNode,
    activePath,
    treeChangeHandler: jest.fn(),
    nodeTitleChangeHandler: jest.fn(),
    nodeClickHandler: jest.fn(),
    nodeDoubleClickHandler: jest.fn(),
    deleteNodeBtnHandler: jest.fn(),
    addNoteBtnHandler: jest.fn(),
    pathNavigatorClickHandler: jest.fn(),
    toolbarHandlersMap,
    toolbarHandlersMap2,
    getNodeKey,
  };

  const { container } = render(<NotesList { ...props }/>);

  const renderedTreeNodeElements = [...container.getElementsByClassName(notesListStyles['dnt__tree-node'])];
  renderedTreeNodeElements.forEach(element => {
    const elementTitle = element.getElementsByTagName('input')[0].value;
    const correspondingNode = find({
      treeData: props.tree,
      getNodeKey,
      searchQuery: elementTitle,
      searchMethod: ({ node, searchQuery }) => node.title === searchQuery,
    }).matches;
    // This assertion is NOT the actual test. For each rendered element, we should have one and only one corresponding node in the treeData.
    expect(correspondingNode).toHaveLength(1);

    fireEvent.dblClick(element);
    // this assertion is the actual test
    expect(props.nodeDoubleClickHandler).lastCalledWith({ id: correspondingNode[0].node.id, path: correspondingNode[0].path });
  });

  const numOfNodesInSourceTree = getFlatDataFromTree({ treeData: props.tree, getNodeKey, ignoreCollapsed: true }).length;
  expect(props.nodeDoubleClickHandler).toBeCalledTimes(numOfNodesInSourceTree);
});

it('should invoke handler when toolbar button is clicked', () => {
  const tree = mockedTree;
  const activeNode = {
    id: mockedTree[0].id,
    path: [mockedTree[0].id],
  };
  const activePath = selectTitlesFromActivePath({ ...baseState, notesTree: { ...baseState.notesTree, tree }, activeNode });
  const props = {
    tree,
    activeNode,
    activePath,
    treeChangeHandler: jest.fn(),
    nodeTitleChangeHandler: jest.fn(),
    nodeClickHandler: jest.fn(),
    deleteNodeBtnHandler: jest.fn(),
    addNoteBtnHandler: jest.fn(),
    pathNavigatorClickHandler: jest.fn(),
    toolbarHandlersMap,
    toolbarHandlersMap2,
    getNodeKey,
  };

  const { queryAllByText } = render(<NotesList { ...props }/>);

  for (let [label, handler] of toolbarHandlersMap) {
    const button = queryAllByText(label);
    expect(button).toHaveLength(1);
    fireEvent.click(button[0]);
    expect(handler).toBeCalled();
  }

  for (let [label, handler] of toolbarHandlersMap2) {
    const button = queryAllByText(label);
    expect(button).toHaveLength(1);
    fireEvent.click(button[0]);
    expect(handler).toBeCalled();
  }

  toolbarHandlersMap.forEach(handler => expect(handler).toBeCalledTimes(1));
  toolbarHandlersMap2.forEach(handler => expect(handler).toBeCalledTimes(1));
});

it('should invoke handler when segment in path navigator is clicked', () => {
  const tree = mockedTree;
  const activeNode = {
    id: mockedTree[0].id,
    path: [mockedTree[0].id],
  };
  const activePath = selectTitlesFromActivePath({ ...baseState, notesTree: { ...baseState.notesTree, tree }, activeNode });
  const props = {
    tree,
    activeNode,
    activePath,
    treeChangeHandler: jest.fn(),
    nodeTitleChangeHandler: jest.fn(),
    nodeClickHandler: jest.fn(),
    deleteNodeBtnHandler: jest.fn(),
    addNoteBtnHandler: jest.fn(),
    pathNavigatorClickHandler: jest.fn(),
    toolbarHandlersMap,
    toolbarHandlersMap2,
    getNodeKey,
  };

  const { container } = render(<NotesList { ...props }/>);
  expect(container.getElementsByClassName(pathNavStyles.dnt__pathnav)).toHaveLength(1);
  const renderedPathNav = container.getElementsByClassName(pathNavStyles.dnt__pathnav).item(0);
  activePath.forEach((segment, idx) => {
    const renderedPathSegment = within(renderedPathNav).getByText(new RegExp(`${segment}`));
    fireEvent.click(renderedPathSegment);
    expect(props.pathNavigatorClickHandler).lastCalledWith({ idx });
    expect(props.pathNavigatorClickHandler).toBeCalledTimes(1);
  });
});

it('should invoke handler when tree node button is clicked', () => {
  const tree = mockedTree;
  const activeNode = {
    id: mockedTree[1].id,
    path: [mockedTree[1].id],
  };
  const activePath = selectTitlesFromActivePath({ ...baseState, notesTree: { ...baseState.notesTree, tree }, activeNode });
  const props = {
    tree,
    activeNode,
    activePath,
    treeChangeHandler: jest.fn(),
    nodeTitleChangeHandler: jest.fn(),
    nodeClickHandler: jest.fn(),
    deleteNodeBtnHandler: jest.fn(),
    addNoteBtnHandler: jest.fn(),
    pathNavigatorClickHandler: jest.fn(),
    toolbarHandlersMap,
    toolbarHandlersMap2,
    getNodeKey,
  };

  const { getByTestId } = render(<NotesList { ...props }/>);

  let numberOfFolders = 0;

  const test = jest.fn();
  test.mockImplementation(({ node, path }) => {
    if (node.type === nodeTypes.FOLDER) {
      numberOfFolders += 1;
      const renderedTreeNode = getByTestId(node.id);
      const renderedTitles = within(renderedTreeNode).queryAllByValue(node.title);
      expect(renderedTitles).toHaveLength(1);
      const nodeAddButton = within(renderedTreeNode).getByText('+');
      const nodeDeleteButton = within(renderedTreeNode).getByText('x');

      fireEvent.click(nodeAddButton);
      expect(props.addNoteBtnHandler).lastCalledWith({ path });
      expect(props.addNoteBtnHandler).toBeCalledTimes(numberOfFolders);

      fireEvent.click(nodeDeleteButton);
      expect(props.deleteNodeBtnHandler).lastCalledWith({ node, path });
      expect(props.deleteNodeBtnHandler).toBeCalledTimes(numberOfFolders);
    }
  });

  walk({
    treeData: props.tree,
    getNodeKey,
    callback: test,
    ignoreCollapsed: true,
  });

  // There is a total of 9 nodes
  expect(test).toBeCalledTimes(9);
});

it('should invoke handler on node title change', () => {
  const tree = mockedTree;
  const activeNode = {
    id: mockedTree[1].id,
    path: [mockedTree[1].id],
  };
  const activePath = selectTitlesFromActivePath({ ...baseState, notesTree: { ...baseState.notesTree, tree }, activeNode });
  const props = {
    tree,
    activeNode,
    activePath,
    treeChangeHandler: jest.fn(),
    nodeTitleChangeHandler: jest.fn(),
    nodeClickHandler: jest.fn(),
    deleteNodeBtnHandler: jest.fn(),
    addNoteBtnHandler: jest.fn(),
    pathNavigatorClickHandler: jest.fn(),
    toolbarHandlersMap,
    toolbarHandlersMap2,
    getNodeKey,
  };

  const { queryAllByValue } = render(<NotesList { ...props }/>);

  let numberOfNodes = 0;
  const test = jest.fn();
  test.mockImplementation(({ node, path }) => {
    const newTitle = 'new test title';
    const renderedInputs = queryAllByValue(node.title);
    expect(renderedInputs).toHaveLength(1);
    const renderedTitle = renderedInputs[0];

    numberOfNodes += 1;
    renderedTitle.value = newTitle;
    fireEvent.blur(renderedTitle);
    expect(props.nodeTitleChangeHandler).lastCalledWith({ node, path, title: newTitle });
    expect(props.nodeTitleChangeHandler).toBeCalledTimes(numberOfNodes);
  });

  walk({
    treeData: props.tree,
    getNodeKey,
    callback: test,
    ignoreCollapsed: true,
  });

  // There is a total of 9 nodes.
  expect(test).toBeCalledTimes(9);
});
