import reducer from './notesTreeReducer';
import notesListActionTypes from '../actions/constants/notesListActionConstants';
import initialState from '../misc/initialState';
import { nodeTypes, NONE_SELECTED } from '../../utils/appCONSTANTS';
import { mockedTree } from '../../test-utils/mocks/mockedNotesTree';

describe('notesTreeReducer ', () => {
  let currentTree, currentState;

  beforeEach(() => {
    // make a copy of the mocked tree
    currentTree = JSON.parse(JSON.stringify(mockedTree));
    currentState = {
      id: 'my-current-state',
      tree: currentTree,
      dateCreated: 1000,
      dateModified: 2000,
    };
  });

  it('should return the initial state by default', () => {
    expect(reducer(undefined, {})).toEqual(initialState.notesTree);
  });

  it('should return current state if no payload received', () => {
    currentState = {
      id: 'current tree ID',
      tree: currentTree,
      dateCreated: 12340,
      dateModified: 56789,
    };
    expect(reducer(currentState, { type: notesListActionTypes.CHANGE_NOTES_TREE })).toBe(currentState);
  });

  it('should return the received tree on CHANGE_NOTES_TREE', () => {
    const newTree = [
      {
        title: 'new test tree',
        subtitle: 'new test tree subtitle',
        uniqid: 'my-new-test-tree',
        get id() {
          return `${this.type}-${this.uniqid}`;
        },
        type: nodeTypes.FOLDER,
        expanded: true,
        children: [
          {
            title: 'new test child 1',
            subtitle: 'new test child subtitle 1',
            uniqid: 'my-new-test-child-1',
            get id() {
              return `${this.type}-${this.uniqid}`;
            },
            type: nodeTypes.FOLDER,
            expanded: true,
            children: [],
          },
          {
            title: 'new test child 2',
            subtitle: 'new test child subtitle 2',
            uniqid: 'my-new-test-child-2',
            get id() {
              return `${this.type}-${this.uniqid}`;
            },
            type: nodeTypes.ITEM,
          },
        ],
      },
    ];
    const expectedNewState = {
      id: 'my-new-state',
      tree: newTree,
      dateCreated: 102030,
      dateModified: 302010,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NOTES_TREE,
      payload: {
        notesTree: expectedNewState,
      },
    })).toEqual({
      ...currentState,
      ...expectedNewState,
    });
  });

  it('should, on CHANGE_NODE_TITLE, return a tree with the title of specified node changed', () => {
    const expectedDate = 20202;
    const newTitle = 'a new title';
    const expectedNewTree = JSON.parse(JSON.stringify(currentTree));
    expectedNewTree[0].children[3].title = newTitle;
    const expectedNewState = {
      ...currentState,
      tree: expectedNewTree,
      dateModified: expectedDate,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NODE_TITLE,
      payload: {
        title: newTitle,
        node: currentTree[0].children[3],
        now: expectedDate,
      },
    })).toEqual(expectedNewState);

    // if node invalid, return current state
    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NODE_TITLE,
      payload: {
        title: newTitle,
        now: expectedDate,
        node: [{ id: 'invalid node' }],
      },
    })).toBe(currentState);

    // if node not found in tree, return current state
    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NODE_TITLE,
      payload: {
        title: newTitle,
        now: expectedDate,
        node: { id: 'not in tree ID' },
      },
    })).toBe(currentState);
  });

  it('should, on DELETE_NODE, return a tree with the specified node removed.', () => {
    const expectedDate = 300300;
    // New tree is current tree but with one node removed
    const expectedNewTree = JSON.parse(JSON.stringify(currentTree));
    expectedNewTree.splice(0, 1);
    const expectedNewState = {
      ...currentState,
      tree: expectedNewTree,
      dateModified: expectedDate,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.DELETE_NODE,
      payload: {
        nodeToDelete: currentTree[0],
        now: expectedDate,
      },
    })).toEqual(expectedNewState);

    // And should return current state if node to delete does not exist on tree
    expect(reducer(currentState, {
      type: notesListActionTypes.DELETE_NODE,
      payload: {
        nodeToDelete: { id: 'non-existant' },
        now: expectedDate,
      },
    })).toBe(currentState);
  });

  it('should, on CHANGE_NOTES_TREE_FOLDER, return modified tree from received node', () => {
    const expectedDate = 4554;
    let newFolder = [
      {
        title: 'new test grandchild 0',
        subtitle: 'new test grandchild subtitle 0',
        uniqid: 'my-new-test-grandchild-0',
        get id() {
          return `${this.type}-${this.uniqid}`;
        },
        type: nodeTypes.ITEM,
      },
      {
        title: 'new test grandchild 1',
        subtitle: 'new test grandchild subtitle 1',
        uniqid: 'my-new-test-grandchild-1',
        get id() {
          return `${this.type}-${this.uniqid}`;
        },
        type: nodeTypes.ITEM,
      },
      {
        title: 'new test grandchild 2',
        subtitle: 'new test grandchild subtitle 2',
        uniqid: 'my-new-test-grandchild-2',
        get id() {
          return `${this.type}-${this.uniqid}`;
        },
        type: nodeTypes.ITEM,
      },
    ];
    let expectedNewTree = JSON.parse(JSON.stringify(currentTree));
    expectedNewTree[0].children[2].children = newFolder;
    let expectedNewState = {
      ...currentState,
      tree: expectedNewTree,
      dateModified: expectedDate,
    };

    // active node is the actual folder to be replaced
    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NOTES_TREE_FOLDER,
      payload: {
        folder: newFolder,
        activePath: [currentTree[0].id, currentTree[0].children[2].id, currentTree[0].children[2]],
        now: expectedDate,
      },
    })).toEqual(expectedNewState);

    // active node is one of the children of the folder to be replaced
    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NOTES_TREE_FOLDER,
      payload: {
        folder: newFolder,
        activePath: [currentTree[0].id, currentTree[0].children[2].id, currentTree[0].children[2].children[0].id],
        now: expectedDate,
      },
    })).toEqual(expectedNewState);

    // should work with empty new folder as well. Here, we are replacing root folder
    newFolder = [];
    expectedNewTree = newFolder;
    expectedNewState = {
      ...currentState,
      tree: expectedNewTree,
      dateModified: expectedDate,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NOTES_TREE_FOLDER,
      payload: {
        folder: newFolder,
        activePath: [currentTree[1].id],
        now: expectedDate,
      },
    })).toEqual(expectedNewState);

    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NOTES_TREE_FOLDER,
      payload: {
        folder: newFolder,
        activePath: [NONE_SELECTED],
        now: expectedDate,
      },
    })).toEqual(expectedNewState);

    // should return current state if folder is invalid (valid folder must be an array)
    newFolder = { id: 'invalid folder' };
    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NOTES_TREE_FOLDER,
      payload: {
        folder: newFolder,
        activePath: [currentTree[0].id, currentTree[0].children[2].id],
        now: expectedDate,
      },
    })).toBe(currentState);

    // should return current state if given path does not lead to folder in tree
    newFolder = [];
    let invalidActivePath = [currentTree[0].id, `${nodeTypes.FOLDER}-non-existent-id`, currentTree[0].children[2].children[0].id];
    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NOTES_TREE_FOLDER,
      payload: {
        folder: newFolder,
        activePath: invalidActivePath,
        now: expectedDate,
      },
    })).toBe(currentState);
  });
});
