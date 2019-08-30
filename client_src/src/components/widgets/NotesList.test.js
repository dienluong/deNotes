import React from 'react';
import NotesList from './NotesList';
import notesListStyles from './NotesList.module.css';
import AppBar from '@material-ui/core/AppBar';
import MuiToolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import HomeIcon from '@material-ui/icons/Home';
import NewFolderIcon from '@material-ui/icons/CreateNewFolder';
import NewNoteIcon from '@material-ui/icons/NoteAdd';
import ExitFolderIcon from '@material-ui/icons/ArrowBackIosOutlined';
import Tree, { find } from 'react-sortable-tree';
import { getNodeKey, collapseFolders } from '../../utils/treeUtils';
import { mockedTree } from '../../test-utils/mocks/mockedNotesTree';
import { render, cleanup, fireEvent } from 'react-testing-library';
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

it('should render header, tree and app bar properly in non-root-view mode', () => {
  // active node is a FOLDER in root, so active folder is that FOLDER node (and not the root); thus, rootViewOn is set to false
  const activeNode = {
    id: mockedTree[0].id,
    path: [mockedTree[0].id],
  };
  const tree = mockedTree[0].children;
  const props = {
    tree,
    size: 'small',
    editMode: false,
    editModeSelectedNodes: [],
    activeNode,
    rootViewOn: false,
    currentFolderName: 'TEST FOLDER NAME',
    treeChangeHandler: jest.fn(),
    nodeTitleChangeHandler: jest.fn(),
    nodeClickHandler: jest.fn(),
    nodeDoubleClickHandler: jest.fn(),
    deleteNodeBtnHandler: jest.fn(),
    backBtnHandler: jest.fn(),
    homeBtnHandler: jest.fn(),
    editBtnHandler: jest.fn(),
    editDoneBtnHandler: jest.fn(),
    toolbarHandlers: [jest.fn(), jest.fn()],
    getNodeKey,
  };

  const expectedTreeProps = {
    treeData: collapseFolders({ tree: props.tree }),
    onChange: props.treeChangeHandler,
    getNodeKey,
  };

  wrapper = shallow(<NotesList { ...props } />);
  expect(wrapper).toMatchSnapshot();

  const treeWrapper = wrapper.find(Tree);
  expect(treeWrapper.exists()).toBe(true);
  expect(treeWrapper.props()).toMatchObject(expectedTreeProps);

  // App bar should contain New Folder and New Note icons and EDIT button
  const appbarWrapper = wrapper.find('div.dnt__notes-list-appbar');
  expect(appbarWrapper.exists()).toBe(true);
  expect(appbarWrapper.find(NewFolderIcon).exists()).toBe(true);
  expect(appbarWrapper.find(NewNoteIcon).exists()).toBe(true);
  expect(appbarWrapper.find(IconButton).filter('[aria-label="Edit"]').render().text()).toEqual('EDIT');

  // Header bar should contain current folder's name, Go Out Folder (aka Back) and Home icons
  const headerWrapper = wrapper.find(AppBar).filter('.dnt__notes-list-header');
  expect(headerWrapper.exists()).toBe(true);
  expect(headerWrapper.find(Typography).render().text()).toEqual(props.currentFolderName);
  // Asserts UI elements specific to non-root-view mode
  expect(headerWrapper.find(MuiToolbar).first().hasClass('dnt__notes-list-muitoolbar')).toBe(true);
  expect(headerWrapper.find(ExitFolderIcon).exists()).toBe(true);
  expect(headerWrapper.find(HomeIcon).exists()).toBe(true);
});

it('should display only folder nodes and all direct child nodes of root, in root-view mode', () => {
  // active node is an ITEM in root, so active folder is the root itself; thus, rootViewOn is set to true
  const activeNode = {
    id: mockedTree[1].id,
    path: [mockedTree[1].id],
  };
  const props = {
    tree: mockedTree,
    size: 'small',
    editMode: false,
    editModeSelectedNodes: [],
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
    editBtnHandler: jest.fn(),
    editDoneBtnHandler: jest.fn(),
    toolbarHandlers: [jest.fn(), jest.fn()],
    getNodeKey,
  };

  wrapper = shallow(<NotesList { ...props } />);

  // Asserts UI elements specific to root-view mode: Go Out Folder and Home icons should NOT be present
  expect(wrapper.find(ExitFolderIcon).exists()).toBe(false);
  expect(wrapper.find(HomeIcon).exists()).toBe(false);
  expect(wrapper.find(MuiToolbar).filter('.dnt__notes-list-muitoolbar--centered').exists()).toBe(true);

  const { container } = render(<NotesList { ...props }/>);
  const invisibleNodes = container.querySelectorAll('.dnt__tree-node--invisible');
  // In the mocked tree, we have strategically assigned titles to the nodes.
  // In this case, title starting w/ "note root0" means all notes that is children of node root0 (first child of root).
  // We expect only these nodes to be invisible in root-view mode. Consequently, folder nodes and direct child nodes of root are visible.
  const check = text => expect(text).toEqual(expect.stringContaining('note root0'));
  invisibleNodes.forEach(node => {
    check(node.textContent);
  });
});

it('should render all node titles of the received tree and highlight the active node', () => {
  // active node is an ITEM, so current folder is its parent; thus, rootViewOn is set to false
  const activeNode = {
    id: mockedTree[0].children[1].id,
    path: [mockedTree[0].children[1].id],
  };
  const tree = mockedTree[0].children;
  const props = {
    tree,
    size: 'medium',
    editMode: false,
    editModeSelectedNodes: [],
    activeNode,
    rootViewOn: false,
    currentFolderName: 'TEST FOLDER NAME',
    treeChangeHandler: jest.fn(),
    nodeTitleChangeHandler: jest.fn(),
    nodeClickHandler: jest.fn(),
    nodeDoubleClickHandler: jest.fn(),
    deleteNodeBtnHandler: jest.fn(),
    backBtnHandler: jest.fn(),
    homeBtnHandler: jest.fn(),
    editBtnHandler: jest.fn(),
    editDoneBtnHandler: jest.fn(),
    toolbarHandlers: [jest.fn(), jest.fn()],
    getNodeKey,
  };

  const { container, queryAllByText } = render(<NotesList { ...props }/>);
  const renderedParagraphs = Array.from(container.getElementsByTagName('p'));
  const renderedTitles = renderedParagraphs.map(p => p.textContent);

  const test = jest.fn();
  test.mockImplementation(node => {
    if (node.id === activeNode.id) {
      const highlightedNodes = container.getElementsByClassName(notesListStyles['dnt__tree-node--active']);
      // should expect only one highlighted node
      expect(highlightedNodes.length).toEqual(1);
      expect(highlightedNodes[0].querySelector('p').textContent).toEqual(node.title);
    }
    expect(queryAllByText(node.title)).toHaveLength(1);
    expect(renderedTitles.includes(node.title)).toBe(true);
  });

  // For each node in the tree sent to NotesList component, run test.
  props.tree.forEach(test);

  // The current active folder has total of 4 children nodes
  expect(test).toBeCalledTimes(4);
  const numOfNodesInSourceTree = props.tree.length;
  const numOfRenderedTreeNodeElements = container.getElementsByClassName(notesListStyles['dnt__tree-node']).length;
  expect(numOfNodesInSourceTree).toEqual(numOfRenderedTreeNodeElements);
});

it('should invoke handler when tree node is clicked', () => {
  // selected node is an note in root folder
  const activeNode = {
    id: mockedTree[1].id,
    path: [mockedTree[1].id],
  };
  const props = {
    tree: mockedTree,
    size: 'medium',
    editMode: false,
    editModeSelectedNodes: [],
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
    editBtnHandler: jest.fn(),
    editDoneBtnHandler: jest.fn(),
    toolbarHandlers: [jest.fn(), jest.fn()],
    getNodeKey,
  };

  const { container } = render(<NotesList { ...props }/>);
  const renderedTreeNodeElements = [...container.getElementsByClassName(notesListStyles['dnt__tree-node'])];
  renderedTreeNodeElements.forEach(element => {
    const elementTitle = element.querySelector('p').textContent;
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

  // All folder nodes and notes nodes in root of the mocked tree should have been clicked.
  expect(props.nodeClickHandler).toBeCalledTimes(5);
});

it('should invoke handler when double-click on node', () => {
  // selected node is a folder in root; so that folder's content is displayed, not the root's; therefore rootViewOn is false
  const activeNode = {
    id: mockedTree[0].id,
    path: [mockedTree[0].id],
  };
  const props = {
    tree: mockedTree[0].children,
    size: 'medium',
    editMode: false,
    editModeSelectedNodes: [],
    activeNode,
    rootViewOn: false,
    currentFolderName: 'TEST FOLDER NAME',
    treeChangeHandler: jest.fn(),
    nodeTitleChangeHandler: jest.fn(),
    nodeClickHandler: jest.fn(),
    nodeDoubleClickHandler: jest.fn(),
    deleteNodeBtnHandler: jest.fn(),
    backBtnHandler: jest.fn(),
    homeBtnHandler: jest.fn(),
    editBtnHandler: jest.fn(),
    editDoneBtnHandler: jest.fn(),
    toolbarHandlers: [jest.fn(), jest.fn()],
    getNodeKey,
  };

  const { container } = render(<NotesList { ...props }/>);
  const renderedTreeNodeElements = [...container.getElementsByClassName(notesListStyles['dnt__tree-node'])];
  renderedTreeNodeElements.forEach(element => {
    const elementTitle = element.querySelector('p').textContent;
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


  expect(props.nodeDoubleClickHandler).toBeCalledTimes(props.tree.length);
});

it('should invoke handler when buttons on toolbars are clicked', () => {
  // active node is a FOLDER in root, so active folder is that FOLDER node (and not the root); thus, rootViewOn is set to false
  const activeNode = {
    id: mockedTree[0].id,
    path: [mockedTree[0].id],
  };
  const tree = mockedTree[0].children;
  const props = {
    tree,
    size: 'small',
    editMode: false,
    editModeSelectedNodes: [],
    activeNode,
    rootViewOn: false,
    currentFolderName: 'TEST FOLDER NAME',
    treeChangeHandler: jest.fn(),
    nodeTitleChangeHandler: jest.fn(),
    nodeClickHandler: jest.fn(),
    nodeDoubleClickHandler: jest.fn(),
    deleteNodeBtnHandler: jest.fn(),
    backBtnHandler: jest.fn(),
    homeBtnHandler: jest.fn(),
    editBtnHandler: jest.fn(),
    editDoneBtnHandler: jest.fn(),
    toolbarHandlers: [jest.fn(), jest.fn()],
    getNodeKey,
  };

  wrapper = shallow(<NotesList { ...props } />);

  wrapper.find(IconButton).forEach(button => button.simulate('click'));
  expect(props.backBtnHandler).toBeCalledTimes(1);
  expect(props.homeBtnHandler).toBeCalledTimes(1);
  props.toolbarHandlers.forEach(handler => expect(handler).toBeCalledTimes(1));
});

it('should invoke handler when EDIT button is clicked', () => {
  const activeNode = {
    id: mockedTree[0].children[0].id,
    path: [mockedTree[0].children[0].id],
  };
  const props = {
    tree: mockedTree[0].children,
    size: 'medium',
    editMode: false,
    editModeSelectedNodes: [],
    activeNode,
    rootViewOn: false,
    currentFolderName: 'TEST FOLDER NAME',
    treeChangeHandler: jest.fn(),
    nodeTitleChangeHandler: jest.fn(),
    nodeClickHandler: jest.fn(),
    nodeDoubleClickHandler: jest.fn(),
    deleteNodeBtnHandler: jest.fn(),
    backBtnHandler: jest.fn(),
    homeBtnHandler: jest.fn(),
    editBtnHandler: jest.fn(),
    editDoneBtnHandler: jest.fn(),
    toolbarHandlers: [jest.fn(), jest.fn()],
    getNodeKey,
  };

  const { queryByText } = render(<NotesList { ...props }/>);

  const editBtn = queryByText('EDIT');
  fireEvent.click(editBtn);
  expect(props.editBtnHandler).toBeCalledTimes(1);
});

it('should invoke handler on node title change in Edit Mode', () => {
  const activeNode = {
    id: mockedTree[0].children[0].id,
    path: [mockedTree[0].children[0].id],
  };
  const props = {
    tree: mockedTree[0].children,
    size: 'medium',
    editMode: true,
    editModeSelectedNodes: [],
    activeNode,
    rootViewOn: false,
    currentFolderName: 'TEST FOLDER NAME',
    treeChangeHandler: jest.fn(),
    nodeTitleChangeHandler: jest.fn(),
    nodeClickHandler: jest.fn(),
    nodeDoubleClickHandler: jest.fn(),
    deleteNodeBtnHandler: jest.fn(),
    backBtnHandler: jest.fn(),
    homeBtnHandler: jest.fn(),
    editBtnHandler: jest.fn(),
    editDoneBtnHandler: jest.fn(),
    toolbarHandlers: [jest.fn(), jest.fn()],
    getNodeKey,
  };

  const { queryAllByValue } = render(<NotesList { ...props }/>);

  let nodeCounter = 0;
  const test = jest.fn();
  test.mockImplementation(node => {
    const newTitle = 'new test title';
    const renderedInputs = queryAllByValue(node.title);
    expect(renderedInputs).toHaveLength(1);
    const renderedTitle = renderedInputs[0];

    nodeCounter += 1;
    renderedTitle.value = newTitle;
    fireEvent.blur(renderedTitle);
    expect(props.nodeTitleChangeHandler).lastCalledWith({ node: expect.any(Object), path: expect.any(Array), title: newTitle });
    expect(props.nodeTitleChangeHandler).toBeCalledTimes(nodeCounter);
  });

  props.tree.forEach(test);
  expect(test).toBeCalledTimes(props.tree.length);
});

it('should invoke handler when DELETE button is clicked and nodes are selected in Edit Mode', () => {
  const activeNode = {
    id: mockedTree[0].children[0].id,
    path: [mockedTree[0].children[0].id],
  };
  const props = {
    tree: mockedTree[0].children,
    size: 'medium',
    editMode: true,
    editModeSelectedNodes: [mockedTree[0].children[1].id, mockedTree[0].children[2].id],
    activeNode,
    rootViewOn: false,
    currentFolderName: 'TEST FOLDER NAME',
    treeChangeHandler: jest.fn(),
    nodeTitleChangeHandler: jest.fn(),
    nodeClickHandler: jest.fn(),
    nodeDoubleClickHandler: jest.fn(),
    deleteNodeBtnHandler: jest.fn(),
    backBtnHandler: jest.fn(),
    homeBtnHandler: jest.fn(),
    editBtnHandler: jest.fn(),
    editDoneBtnHandler: jest.fn(),
    toolbarHandlers: [jest.fn(), jest.fn()],
    getNodeKey,
  };

  const { queryByText } = render(<NotesList { ...props }/>);

  const deleteBtn = queryByText('DELETE');
  fireEvent.click(deleteBtn);
  expect(props.deleteNodeBtnHandler).toBeCalledTimes(1);
});

it('should invoke handler when DONE button is clicked in Edit Mode', () => {
  const activeNode = {
    id: mockedTree[0].children[0].id,
    path: [mockedTree[0].children[0].id],
  };
  const props = {
    tree: mockedTree[0].children,
    size: 'medium',
    editMode: true,
    editModeSelectedNodes: [mockedTree[0].children[1].id, mockedTree[0].children[2].id],
    activeNode,
    rootViewOn: false,
    currentFolderName: 'TEST FOLDER NAME',
    treeChangeHandler: jest.fn(),
    nodeTitleChangeHandler: jest.fn(),
    nodeClickHandler: jest.fn(),
    nodeDoubleClickHandler: jest.fn(),
    deleteNodeBtnHandler: jest.fn(),
    backBtnHandler: jest.fn(),
    homeBtnHandler: jest.fn(),
    editBtnHandler: jest.fn(),
    editDoneBtnHandler: jest.fn(),
    toolbarHandlers: [jest.fn(), jest.fn()],
    getNodeKey,
  };

  const { queryByText } = render(<NotesList { ...props }/>);

  const doneBtn = queryByText('DONE');
  fireEvent.click(doneBtn);
  expect(props.editDoneBtnHandler).toBeCalledTimes(1);
});

it('should render Edit Mode correctly, i.e. header bar w/o Back and Home icons and Edit Mode appbar visible', () => {
  const activeNode = {
    id: mockedTree[0].children[0].id,
    path: [mockedTree[0].children[0].id],
  };
  const props = {
    tree: mockedTree[0].children,
    size: 'medium',
    editMode: true,
    editModeSelectedNodes: [mockedTree[0].children[1].id, mockedTree[0].children[2].id],
    activeNode,
    rootViewOn: false,
    currentFolderName: 'TEST FOLDER NAME',
    treeChangeHandler: jest.fn(),
    nodeTitleChangeHandler: jest.fn(),
    nodeClickHandler: jest.fn(),
    nodeDoubleClickHandler: jest.fn(),
    deleteNodeBtnHandler: jest.fn(),
    backBtnHandler: jest.fn(),
    homeBtnHandler: jest.fn(),
    editBtnHandler: jest.fn(),
    editDoneBtnHandler: jest.fn(),
    toolbarHandlers: [jest.fn(), jest.fn()],
    getNodeKey,
  };

  wrapper = shallow(<NotesList { ...props } />);
  expect(wrapper).toMatchSnapshot();

  expect(wrapper.find(Tree).exists()).toBe(true);

  // Edit Mode appbar should be visible (i.e. Collapse in=true)
  expect(wrapper.find('#dnt__notes-list-appbar--editmode').parent().find(Collapse).prop('in')).toBe(true);

  // Default appbar should NOT be visible (i.e. Collapse in=false)
  expect(wrapper.find('#dnt__notes-list-appbar--defaultmode').parent().find(Collapse).prop('in')).toBe(false);

  // Header bar should contain current folder's name but without Go Out Folder (aka Back) and Home icons
  const headerWrapper = wrapper.find(AppBar).filter('.dnt__notes-list-header');
  expect(headerWrapper.exists()).toBe(true);
  expect(headerWrapper.find(MuiToolbar).first().hasClass('dnt__notes-list-muitoolbar--centered')).toBe(true);
  expect(headerWrapper.find(Typography).render().text()).toEqual(props.currentFolderName);
  expect(headerWrapper.find(ExitFolderIcon).exists()).toBe(false);
  expect(headerWrapper.find(HomeIcon).exists()).toBe(false);
});
