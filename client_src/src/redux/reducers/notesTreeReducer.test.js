import reducer from './notesTreeReducer';
import notesListActionTypes from '../actions/constants/notesListActionConstants';
import initialState from '../misc/initialState';

describe('notesTreeReducer', () => {
  it('should return the initial state by default', () => {
    expect(reducer(undefined, {})).toEqual(initialState.notesTree);
  });

  it('should, on CHANGE_NOTES_TREE, return the received tree', () => {
    const currentTree = [
      {
        title: 'test tree',
        subtitle: 'test tree subtitle',
        uniqid: 'my-test-tree',
        get id() {
          return `${this.type}-${this.uniqid}`;
        },
        type: 'folder',
        expanded: true,
        children: [
          {
            title: 'test child',
            subtitle: 'test child subtitle',
            uniqid: 'my-test-child',
            get id() {
              return `${this.type}-${this.uniqid}`;
            },
            type: 'item',
          },
        ],
      },
    ];
    const currentState = {
      id: 'my-current-state',
      tree: currentTree,
      dateCreated: 10,
      dateModified: 20,
    };
    const newTree = [
      {
        title: 'test tree',
        subtitle: 'test tree subtitle',
        uniqid: 'my-test-tree',
        get id() {
          return `${this.type}-${this.uniqid}`;
        },
        type: 'folder',
        expanded: true,
        children: [
          {
            title: 'test child 1',
            subtitle: 'test child subtitle 1',
            uniqid: 'my-test-child-1',
            get id() {
              return `${this.type}-${this.uniqid}`;
            },
            type: 'folder',
            expanded: false,
            children: [],
          },
          {

            title: 'test child 2',
            subtitle: 'test child subtitle 2',
            uniqid: 'my-test-child-2',
            get id() {
              return `${this.type}-${this.uniqid}`;
            },
            type: 'item',
          }
        ],
      },
    ];
    const newState = {
      id: 'my-new-state',
      tree: newTree,
      dateCreated: 101,
      dateModified: 202,
    };

    expect(reducer(currentState, {
      type: notesListActionTypes.CHANGE_NOTES_TREE,
      payload: {
        notesTree: newState,
      },
    })).toEqual({
      ...currentState,
      ...newState,
    });
  });
});
