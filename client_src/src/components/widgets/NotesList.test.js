import React from 'react';
import NotesList from './NotesList';
import { render, cleanup, fireEvent } from 'react-testing-library';
import 'jest-dom/extend-expect';
import { walk, find, getFlatDataFromTree } from 'react-sortable-tree';
import { getNodeKey } from '../../utils/treeUtils';
import baseState from '../../redux/misc/initialState';
import { selectTitlesFromActivePath } from '../../redux/selectors';
import { mockedTree } from '../../test-utils/mocks/mockedNotesTree';

const TREE_NODE_CLASS = 'dnt__tree-node';

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

  const numOfRenderedTreeNodeElements = container.getElementsByClassName(TREE_NODE_CLASS).length;
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

  const renderedTreeNodeElements = [...container.getElementsByClassName(TREE_NODE_CLASS)];
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
