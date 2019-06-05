import React from 'react';
import NotesListDrawer from './NotesListDrawer';
import NotesList from './NotesList';
import Drawer from '@material-ui/core/Drawer';
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

it('should render drawer using material-ui Drawer w/ proper props and pass remaining props to NotesList', () => {
  const handleDrawerToggle = jest.fn();
  const notesListProp1 = 'dummy-prop';
  const notesListProp2 = 1234;
  const props = {
    drawerOpen: false,
    drawerSide: 'right',
    size: 'small',
    handleDrawerToggle,
    notesListProp1,
    notesListProp2,
  };
  const expectedDrawerProps = {
    anchor: props.drawerSide,
    open: props.drawerOpen,
    onClose: handleDrawerToggle,
  };
  const expectedNotesListProps = {
    notesListProp1,
    notesListProp2,
  };

  wrapper = shallow(<NotesListDrawer { ...props } />);
  expect(wrapper).toMatchSnapshot();
  const drawerWrapper = wrapper.find(Drawer);
  expect(drawerWrapper.exists()).toBe(true);
  expect(drawerWrapper.props()).toMatchObject(expectedDrawerProps);
  const notesListWrapper = drawerWrapper.find(NotesList);
  expect(notesListWrapper.exists()).toBe(true);
  expect(notesListWrapper.props()).toMatchObject(expectedNotesListProps);
});
