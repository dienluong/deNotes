import React from 'react';
import DrawerButtonContainer from './DrawerButtonContainer';
import DrawerButton from './widgets/DrawerButton';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { render, cleanup } from '@testing-library/react';
import 'jest-dom/extend-expect';
import initialState from '../redux/misc/initialState';
import { MutationObserver } from '../test-utils/MutationObserver';

// Configure Enzyme
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });
let wrapper = {};

beforeAll(() => {
  // Required for rendering Quill editor
  global.MutationObserver = MutationObserver;
  document.getSelection = function() {
    return {
      getRangeAt: () => {},
    };
  };
});

afterEach(() => {
  if (typeof wrapper.unmount === 'function') {
    wrapper.unmount();
  }
  cleanup();
});

it('renders DrawerButton with "visible" prop set to false because loggedIn is false', () => {
  const mockedInitialState = {
    ...initialState,
    connectionInfo: {
      loggedIn: false,
    },
  };
  const dummyClickHandler = () => {};
  const dummyOwnProps = {
    size: 'medium',
    visible: true,
    clickHandler: dummyClickHandler,
    className: 'someClassName',
  };
  const expectedProps = {
    ...dummyOwnProps,
    visible: false,
  };
  const store = createMockStore([thunk])(mockedInitialState);
  const { container } = render(<Provider store={ store }><DrawerButtonContainer {...dummyOwnProps }/></Provider>);
  expect(container).toMatchSnapshot();

  wrapper = shallow(<Provider store={ store }><DrawerButtonContainer { ...dummyOwnProps }/></Provider>).dive({ context: { store } });
  expect(wrapper.find(DrawerButton).exists()).toBe(true);
  expect(wrapper.find(DrawerButton).props()).toMatchObject(expectedProps);
});

it('renders DrawerButton with "visible" prop taking the passed value because loggedIn is true', () => {
  const mockedInitialState = {
    ...initialState,
    connectionInfo: {
      loggedIn: true,
    },
  };
  const dummyClickHandler = () => {};
  // Case 1: passing visible = true
  let dummyOwnProps = {
    size: 'medium',
    visible: true,
    clickHandler: dummyClickHandler,
    className: 'someClassName',
  };
  let expectedProps = {
    ...dummyOwnProps,
    visible: true,
  };
  let store = createMockStore([thunk])(mockedInitialState);
  const { container } = render(<Provider store={ store }><DrawerButtonContainer {...dummyOwnProps }/></Provider>);
  expect(container).toMatchSnapshot();

  wrapper = shallow(<Provider store={ store }><DrawerButtonContainer { ...dummyOwnProps }/></Provider>).dive({ context: { store } });
  expect(wrapper.find(DrawerButton).exists()).toBe(true);
  expect(wrapper.find(DrawerButton).props()).toMatchObject(expectedProps);

  // Case 2: passing visible = false
  dummyOwnProps = {
    size: 'small',
    visible: false,
    clickHandler: dummyClickHandler,
    className: 'someClassName2',
  };
  expectedProps = {
    ...dummyOwnProps,
    visible: false,
  };

  store = createMockStore([thunk])(mockedInitialState);
  wrapper = shallow(<Provider store={ store }><DrawerButtonContainer { ...dummyOwnProps }/></Provider>).dive({ context: { store } });
  expect(wrapper.find(DrawerButton).exists()).toBe(true);
  expect(wrapper.find(DrawerButton).props()).toMatchObject(expectedProps);
});

