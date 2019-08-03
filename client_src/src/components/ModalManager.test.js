import React from 'react';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import initialState from '../redux/misc/initialState';
import ModalManager, { MODAL_TYPES } from './ModalManager';
import RenameNodeModal from './widgets/RenameNodeModal';

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

it('renders specified modal correctly with prop values taken from redux store', () => {
  let mockedInitialState = {
    ...initialState,
    modalInfo: {
      type: MODAL_TYPES.RENAME_NODE,
      props: {
        prop1: 'abcdef',
        prop2: 123456,
        prop3: [1, 'A', false],
      },
    },
  };
  let store = createMockStore([])(mockedInitialState);
  const expectedProps = { ...mockedInitialState.modalInfo.props };

  wrapper = shallow(<Provider store={ store }><ModalManager /></Provider>).dive({ context: { store } }).dive({ context: { store } });
  expect(wrapper).toMatchSnapshot();

  expect(wrapper.find(RenameNodeModal).exists()).toBe(true);
  expect(wrapper.find(RenameNodeModal).props()).toMatchObject(expectedProps);
});

it('renders nothing if give invalid modal type', () => {
  let mockedInitialState = {
    ...initialState,
    modalInfo: {
      type: MODAL_TYPES['BOGUS_MODAL'],
      props: {
        prop1: 'abcdef',
        prop2: 123456,
        prop3: [1, 'A', false],
      },
    },
  };
  let store = createMockStore([])(mockedInitialState);

  wrapper = shallow(<Provider store={ store }><ModalManager /></Provider>).dive({ context: { store } }).dive({ context: { store } });
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.isEmptyRender()).toBe(true);

  wrapper.unmount();

  mockedInitialState = {
    ...initialState,
    modalInfo: {
      props: {
        prop1: 'abcdef',
        prop2: 123456,
        prop3: [1, 'A', false],
      },
    },
  };
  store = createMockStore([])(mockedInitialState);

  wrapper = shallow(<Provider store={ store }><ModalManager /></Provider>).dive({ context: { store } }).dive({ context: { store } });
  expect(wrapper.isEmptyRender()).toBe(true);
});
