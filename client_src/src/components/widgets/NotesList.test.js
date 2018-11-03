import React from 'react';
import NotesList from './NotesList';
import { render, cleanup } from 'react-testing-library';
import 'jest-dom/extend-expect';
import { walk } from 'react-sortable-tree';
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
  console.log('\n' + renderedTitles + '\n');

  const test = ({ node }) => {
    // console.log(node.title + '\n\n\n\n\n\n\n\n');
    expect(queryAllByValue(node.title)).toHaveLength(1);
    expect(renderedTitles.includes(node.title)).toBe(true);
  };

  walk({
    treeData: props.tree,
    getNodeKey,
    callback: test,
    ignoreCollapsed: false,
  });
});
