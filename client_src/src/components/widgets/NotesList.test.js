import React from 'react';
import NotesList from './NotesList';
import notesListStyles from './NotesList.module.css';
import pathNavStyles from './PathNavigator.module.css';
import { render, cleanup, fireEvent, within, getNodeText } from 'react-testing-library';
import 'jest-dom/extend-expect';
import { walk, find, getFlatDataFromTree } from 'react-sortable-tree';
import { getNodeKey } from '../../utils/treeUtils';
import baseState from '../../redux/misc/initialState';
import { selectTitlesFromActivePath } from '../../redux/selectors';
import { mockedTree } from '../../test-utils/mocks/mockedNotesTree';

afterEach(cleanup);

it('should render all node titles in the first level of the received tree', () => {
  const tree = mockedTree;
  const activeNode = baseState.activeNode;
  const activePath = selectTitlesFromActivePath(baseState);
  const toolbarHandlersMap = new Map();
  toolbarHandlersMap.set('tool1', jest.fn());
  toolbarHandlersMap.set('tool2', jest.fn());
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
    getNodeKey,
  };

  const { container, queryAllByValue } = render(<NotesList { ...props }/>);

  expect(container).toMatchSnapshot();
  const renderedInputs = Array.from(container.getElementsByTagName('input'));
  const renderedTitles = renderedInputs.map(input => input.value);
  // const renderedTitles = renderedInputs.map(getNodeText);
  console.log(renderedTitles);

  const test = (node) => {
    expect(queryAllByValue(node.title)).toHaveLength(1);
    expect(renderedTitles.includes(node.title)).toBe(true);
  };

  props.tree.forEach(test);

  // walk({
  //   treeData: props.tree,
  //   getNodeKey,
  //   callback: test,
  //   ignoreCollapsed: false,
  // });

  const numOfRenderedTreeNodeElements = container.getElementsByClassName(notesListStyles['dnt__tree-node']).length;
  // const numOfNodesInSourceTree = getFlatDataFromTree({ treeData: props.tree, getNodeKey, ignoreCollapsed: false }).length;
  const numOfNodesInSourceTree = props.tree.length;
  expect(numOfRenderedTreeNodeElements).toEqual(numOfNodesInSourceTree);
});

it('should invoke handler when tree node is clicked', () => {
  const tree = mockedTree;
  const activeNode = baseState.activeNode;
  const activePath = selectTitlesFromActivePath(baseState);
  const toolbarHandlersMap = new Map();
  toolbarHandlersMap.set('tool1', jest.fn());
  toolbarHandlersMap.set('tool2', jest.fn());
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

  const numberOfNodes = getFlatDataFromTree({ treeData: props.tree, getNodeKey, ignoreCollapsed: false }).length;
  expect(props.nodeClickHandler).toBeCalledTimes(numberOfNodes);
});

it('should invoke handlers when toolbar button is clicked', () => {
  const tree = mockedTree;
  const activeNode = baseState.activeNode;
  const activePath = selectTitlesFromActivePath(baseState);
  const toolbarHandlersMap = new Map();
  toolbarHandlersMap.set('tool1', jest.fn());
  toolbarHandlersMap.set('tool2', jest.fn());
  toolbarHandlersMap.set('tool3', jest.fn());
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
    getNodeKey,
  };

  const { queryAllByText } = render(<NotesList { ...props }/>);

  for (let [label, handler] of toolbarHandlersMap) {
    const button = queryAllByText(label);
    expect(button).toHaveLength(1);
    fireEvent.click(button[0]);
    expect(handler).toBeCalled();
  }

  toolbarHandlersMap.forEach(handler => expect(handler).toBeCalledTimes(1));
});

it('should invoke handler when segment in path navigator is clicked', () => {
  const tree = mockedTree;
  const activeNode = baseState.activeNode;
  const activePath = selectTitlesFromActivePath(baseState);
  const toolbarHandlersMap = new Map();
  toolbarHandlersMap.set('tool1', jest.fn());
  toolbarHandlersMap.set('tool2', jest.fn());
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
    getNodeKey,
  };

  const { container } = render(<NotesList { ...props }/>);
  expect(container.getElementsByClassName(pathNavStyles.dnt__pathnav)).toHaveLength(1);
  const renderedPathNav = container.getElementsByClassName(pathNavStyles.dnt__pathnav).item(0);
  activePath.forEach((segment, idx) => {
    const renderedPathSegment = within(renderedPathNav).getByText(new RegExp(`${segment}`));
    fireEvent.click(renderedPathSegment);
    expect(props.pathNavigatorClickHandler).lastCalledWith({ idx });
  });
});

it('should invoke handler when tree node button is clicked', () => {
  const tree = mockedTree;
  const activeNode = baseState.activeNode;
  const activePath = selectTitlesFromActivePath(baseState);
  const toolbarHandlersMap = new Map();
  toolbarHandlersMap.set('tool1', jest.fn());
  toolbarHandlersMap.set('tool2', jest.fn());
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
    getNodeKey,
  };

  const { getByTestId } = render(<NotesList { ...props }/>);

  let numberOfFolders = 0;
  const test = ({ node, path }) => {
    if (node.type === 'folder') {
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
  };

  walk({
    treeData: props.tree,
    getNodeKey,
    callback: test,
    ignoreCollapsed: false,
  });
});

it('should invoke handler on node title change', () => {
  const tree = mockedTree;
  const activeNode = baseState.activeNode;
  const activePath = selectTitlesFromActivePath(baseState);
  const toolbarHandlersMap = new Map();
  toolbarHandlersMap.set('tool1', jest.fn());
  toolbarHandlersMap.set('tool2', jest.fn());
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
    getNodeKey,
  };

  const { queryAllByValue } = render(<NotesList { ...props }/>);

  let numberOfNodes = 0;
  const test = ({ node, path }) => {
    const newTitle = 'new test title';
    const renderedInputs = queryAllByValue(node.title);
    expect(renderedInputs).toHaveLength(1);
    const renderedTitle = renderedInputs[0];

    numberOfNodes += 1;
    renderedTitle.value = newTitle;
    fireEvent.blur(renderedTitle);
    expect(props.nodeTitleChangeHandler).lastCalledWith({ node, path, title: newTitle });
    expect(props.nodeTitleChangeHandler).toBeCalledTimes(numberOfNodes);
  };

  walk({
    treeData: props.tree,
    getNodeKey,
    callback: test,
    ignoreCollapsed: false,
  });
});
