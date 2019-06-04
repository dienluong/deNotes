import React from 'react';
import Main from './Main';
import EditorContainer from './EditorContainer';
import NotesListContainer from './NotesListContainer';
import DrawerButton from './widgets/DrawerButton';
import Fab from '@material-ui/core/Fab';
jest.mock('@material-ui/core/useMediaQuery');
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import initialState from '../redux/misc/initialState';
import { createSerializer } from 'enzyme-to-json';

// Configure Enzyme
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });
let wrapper = {};

// Configure snapshot serializer
expect.addSnapshotSerializer(createSerializer());

beforeAll(() => {
  useMediaQuery.mockImplementation(() => {
    return false;
  });
});

afterEach(() => {
  if (typeof wrapper.unmount === 'function') {
    wrapper.unmount();
  }
});

it('renders Main correctly using EditorContainer, NotesListContainer and DrawerButton', () => {
  let store = createMockStore([thunk])(initialState);
  wrapper = shallow(<Provider store={ store }><Main /></Provider>).dive({ context: { store } });
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.find(EditorContainer).exists()).toBe(true);
  expect(wrapper.find(NotesListContainer).exists()).toBe(true);
  expect(wrapper.find(DrawerButton).exists()).toBe(true);
});

it('sets size to medium and disables minimalist style for width larger than 600px', () => {
  useMediaQuery.mockImplementation(query => {
    return !(query === '(max-width:600px)');
  });
  let store = createMockStore([thunk])(initialState);
  wrapper = shallow(<Provider store={ store }><Main /></Provider>).dive({ context: { store } });
  expect(wrapper.find(EditorContainer).prop('minimalist')).toBe(false);
  expect(wrapper.find(NotesListContainer).prop('size')).toBe('medium');
  expect(wrapper.find(DrawerButton).prop('size')).toBe('medium');
});

it('sets size to small and enables minimalist style when max width is 600px', () => {
  useMediaQuery.mockImplementation(query => {
    return query === '(max-width:600px)';
  });
  let store = createMockStore([thunk])(initialState);
  wrapper = shallow(<Provider store={ store }><Main /></Provider>).dive({ context: { store } });
  expect(wrapper.find(EditorContainer).prop('minimalist')).toBe(true);
  expect(wrapper.find(NotesListContainer).prop('size')).toBe('small');
  expect(wrapper.find(DrawerButton).prop('size')).toBe('small');
});

it('opens drawer when drawer button clicked', () => {
  let store = createMockStore([thunk])(initialState);
  wrapper = shallow(<Provider store={ store }><Main /></Provider>).dive({ context: { store } });
  expect(wrapper.find(NotesListContainer).prop('drawerOpen')).toBe(false);
  expect(wrapper.find(DrawerButton).prop('visible')).toBe(true);
  wrapper.find(DrawerButton).dive().find(Fab).simulate('click');
  expect(wrapper.find(NotesListContainer).prop('drawerOpen')).toBe(true);
  expect(wrapper.find(DrawerButton).prop('visible')).toBe(false);
});
