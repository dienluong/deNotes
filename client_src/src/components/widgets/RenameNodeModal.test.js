import React from 'react';
import RenameNodeModal from './RenameNodeModal';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import { nodeTypes } from '../../utils/appCONSTANTS';
import { createSerializer } from 'enzyme-to-json';
import { render, cleanup, fireEvent } from 'react-testing-library';
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

it('renders MUI Dialog and TextField containing current name', () => {
  const props = {
    nodeType: nodeTypes.ITEM,
    currentName: 'current test node name',
    onCloseHandler: jest.fn(),
    onSubmitHandler: jest.fn(),
  };

  wrapper = shallow(<RenameNodeModal { ...props } />);
  expect(wrapper).toMatchSnapshot();

  expect(wrapper.find(Dialog).exists()).toBe(true);
  expect(wrapper.find(Dialog).prop('open')).toBe(true);
  expect(wrapper.find(TextField).exists()).toBe(true);
  expect(wrapper.find(TextField).props()).toMatchObject({ defaultValue: props.currentName });
});

it('calls provided close and submit handlers', () => {
  const props = {
    nodeType: nodeTypes.ITEM,
    currentName: 'current test node name',
    onCloseHandler: jest.fn(),
    onSubmitHandler: jest.fn(),
  };

  wrapper = shallow(<RenameNodeModal { ...props } />);

  // Test onClose event
  const dialogWrapper = wrapper.find(Dialog);
  expect(dialogWrapper.exists()).toBe(true);
  const onCloseHandler = dialogWrapper.prop('onClose');
  expect(onCloseHandler).toBeInstanceOf(Function);
  onCloseHandler();
  expect(props.onCloseHandler).toBeCalledTimes(1);
  props.onCloseHandler.mockClear();

  // Test cancel button
  const cancelWrapper = wrapper.find({ 'aria-label': 'Cancel Rename Dialog' });
  expect(cancelWrapper.exists()).toBe(true);
  cancelWrapper.simulate('click');
  expect(props.onCloseHandler).toBeCalledTimes(1);
  props.onCloseHandler.mockClear();

  // Test form submit
  const formWrapper = wrapper.find('form');
  expect(formWrapper.exists()).toBe(true);
  const evt = {
    preventDefault: jest.fn(),
  };
  formWrapper.simulate('submit', evt);
  expect(props.onSubmitHandler).toBeCalledTimes(1);
  expect(props.onSubmitHandler).lastCalledWith({ name: props.currentName });
  // Submit event also closes the Dialog modal
  expect(props.onCloseHandler).toBeCalledTimes(1);
  props.onCloseHandler.mockClear();
  props.onSubmitHandler.mockClear();

  // Test OK button
  const okWrapper = wrapper.find({ 'aria-label': 'OK Rename Dialog' });
  expect(okWrapper.exists()).toBe(true);
  okWrapper.simulate('click', evt);
  expect(props.onSubmitHandler).toBeCalledTimes(1);
  expect(props.onSubmitHandler).lastCalledWith({ name: props.currentName });
  // Submit event also closes the Dialog modal
  expect(props.onCloseHandler).toBeCalledTimes(1);
});

it('returns the newly entered name on submit', () => {
  const props = {
    nodeType: nodeTypes.ITEM,
    currentName: 'current test node name',
    onCloseHandler: jest.fn(),
    onSubmitHandler: jest.fn(),
  };

  const newName = 'this is a new name';

  const { getByValue, getByText } = render(<RenameNodeModal { ...props } />);
  const textInput = getByValue(props.currentName);
  const okButton = getByText('OK');
  fireEvent.change(textInput, { target: { value: newName } });
  fireEvent.click(okButton);
  expect(props.onSubmitHandler).lastCalledWith({ name: newName });
});
