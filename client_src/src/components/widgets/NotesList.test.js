import React from 'react';
import NotesList from './NotesList';
import notesListStyles from './NotesList.module.css';
import pathNavStyles from './PathNavigator.module.css';
import { render, cleanup, fireEvent, within } from 'react-testing-library';
import 'jest-dom/extend-expect';
import { walk, find, getFlatDataFromTree } from 'react-sortable-tree';
import { getNodeKey } from '../../utils/treeUtils';
import baseState from '../../redux/misc/initialState';
import { selectTitlesFromActivePath } from '../../redux/selectors';
import { mockedTree } from '../../test-utils/mocks/mockedNotesTree';

afterEach(cleanup);

it('should render all node titles', () => {
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

  const renderedInputs = Array.from(container.getElementsByTagName('input'));
  const renderedTitles = renderedInputs.map(input => input.value);

  const test = ({ node }) => {
    expect(queryAllByValue(node.title)).toHaveLength(1);
    expect(renderedTitles.includes(node.title)).toBe(true);
  };

  walk({
    treeData: props.tree,
    getNodeKey,
    callback: test,
    ignoreCollapsed: false,
  });

  const numOfRenderedTreeNodeElements = container.getElementsByClassName(notesListStyles['dnt__tree-node']).length;
  const numOfNodesInSourceTree = getFlatDataFromTree({ treeData: props.tree, getNodeKey, ignoreCollapsed: false }).length;
  expect(numOfNodesInSourceTree).toEqual(numOfRenderedTreeNodeElements);
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

it('should invoke handlers when toolbar button clicked', () => {
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
  activePath.forEach(segment => {
    const renderedPathSegment = within(renderedPathNav).getByText(new RegExp(`${segment}`));
    fireEvent.click(renderedPathSegment);
    expect(props.pathNavigatorClickHandler).toBeCalled();
    props.pathNavigatorClickHandler.mockClear();
  });
});
