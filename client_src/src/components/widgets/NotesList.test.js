import NotesList from './NotesList';
import React from 'react';
import { render, cleanup, fireEvent } from 'react-testing-library';
import 'jest-dom/extend-expect';
import { selectTitlesFromActivePath } from '../../redux/selectors';
import { walk } from 'react-sortable-tree';
import { getNodeKey } from '../../utils/treeUtils';
import baseState from '../../redux/misc/initialState';
import { mockedTree } from '../../test-utils/mocks/mockedNotesTree';
import Tree from 'react-sortable-tree';

afterEach(cleanup);

it('should render all node titles', () => {
  const tree = baseState.notesTree.tree;
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

  const { queryAllByText, debug } = render(<NotesList { ...props }/>);
  // const { queryAllByText, debug } = render(<Tree treeData={ tree } onChange={ props.treeChangeHandler } getNodeKey={ getNodeKey } />);
  debug();
  const callback = ({ node }) => {
    console.log(node.title);
    expect(queryAllByText(node.title)).toHaveLength(1);
  };

  walk({
    treeData: props.tree,
    getNodeKey,
    callback,
    ignoreCollapsed: false,
  });
});
