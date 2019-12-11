import React from 'react';
import DrawerButtonContainer from './DrawerButtonContainer';
import DrawerButton from './widgets/DrawerButton';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { render, cleanup, fireEvent } from '@testing-library/react';
import 'jest-dom/extend-expect';
import initialState from '../redux/misc/initialState';
import { MutationObserver } from '../test-utils/MutationObserver';
jest.mock('../redux/actions/drawerButtonActions');
import { clickAction } from '../redux/actions/drawerButtonActions';


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
  clickAction.mockClear();
});

it('renders DrawerButton with "visible" prop set to false because loggedIn is false', () => {
  // NOTE: when notes tree's visible = false, drawer button should be visible;
  // *but* if user is not logged in, then button is expected to be always not visible
  const mockedInitialState = {
    ...initialState,
    notesTree: {
      ...initialState.notesTree,
      visible: false,
    },
    connectionInfo: {
      loggedIn: false,
    },
  };
  const dummyOwnProps = {
    size: 'medium',
    className: 'someClassName',
  };

  // button expected to be not visible
  const expectedProps = {
    ...dummyOwnProps,
    visible: false,
    clickHandler: expect.any(Function),
  };
  const store = createMockStore([thunk])(mockedInitialState);
  const { container } = render(<Provider store={ store }><DrawerButtonContainer {...dummyOwnProps }/></Provider>);
  expect(container).toMatchSnapshot();

  wrapper = shallow(<Provider store={ store }><DrawerButtonContainer { ...dummyOwnProps }/></Provider>).dive({ context: { store } });
  expect(wrapper.find(DrawerButton).exists()).toBe(true);
  expect(wrapper.find(DrawerButton).props()).toMatchObject(expectedProps);
});

it('renders DrawerButton with "visible" prop taking the passed value because loggedIn is true', () => {
  let dummyOwnProps = {
    size: 'medium',
    className: 'someClassName',
  };
  // Case 1: Logged in + notes tree not visible -> expect drawer button visible
  let mockedInitialState = {
    ...initialState,
    notesTree: {
      ...initialState.notesTree,
      visible: false,
    },
    connectionInfo: {
      loggedIn: true,
    },
  };
  let expectedProps = {
    ...dummyOwnProps,
    visible: true,
    clickHandler: expect.any(Function),
  };
  let store = createMockStore([thunk])(mockedInitialState);
  const { container } = render(<Provider store={ store }><DrawerButtonContainer {...dummyOwnProps }/></Provider>);
  expect(container).toMatchSnapshot();

  wrapper = shallow(<Provider store={ store }><DrawerButtonContainer { ...dummyOwnProps }/></Provider>).dive({ context: { store } });
  expect(wrapper.find(DrawerButton).exists()).toBe(true);
  expect(wrapper.find(DrawerButton).props()).toMatchObject(expectedProps);

  dummyOwnProps = {
    size: 'small',
    className: 'someClassName2',
  };
  // Case 2: Logged in + notes tree visible -> expect drawer button to be not visible
  mockedInitialState = {
    ...initialState,
    notesTree: {
      ...initialState.notesTree,
      visible: true,
    },
    connectionInfo: {
      loggedIn: true,
    },
  };

  expectedProps = {
    ...dummyOwnProps,
    visible: false,
    clickHandler: expect.any(Function),
  };

  store = createMockStore([thunk])(mockedInitialState);
  wrapper = shallow(<Provider store={ store }><DrawerButtonContainer { ...dummyOwnProps }/></Provider>).dive({ context: { store } });
  expect(wrapper.find(DrawerButton).exists()).toBe(true);
  expect(wrapper.find(DrawerButton).props()).toMatchObject(expectedProps);
});

it('should call the proper callback on click event', () => {
  const mockedInitialState = {
    ...initialState,
    notesTree: {
      ...initialState.notesTree,
      visible: false,
    },
    connectionInfo: {
      loggedIn: true,
    },
  };
  clickAction.mockImplementation(() => ({ type: 'DUMMY_ACTION_TYPE', payload: 'DUMMY_PAYLOAD' }));
  const store = createMockStore([thunk])(mockedInitialState);
  const { container } = render(<Provider store={ store }><DrawerButtonContainer /></Provider>);
  const button = container.getElementsByTagName('button')[0];
  fireEvent.click(button);
  expect(clickAction).toBeCalledTimes(1);
});
