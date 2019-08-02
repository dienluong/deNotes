import NodeTitle from './NodeTitle';
import React from 'react';
import { render, cleanup, fireEvent } from 'react-testing-library';
import 'jest-dom/extend-expect';
import { nodeTypes } from '../../utils/appCONSTANTS';

afterEach(cleanup);

it('renders an element composed of an input with value corresponding to node title', () => {
  const props = {
    node: {
      title: 'test-node',
      id: 'test-node-id',
      type: nodeTypes.FOLDER,
      expanded: true,
      children: [],
    },
    path: ['step1', 'step2'],
    onSubmit: jest.fn(),
  };

  const { container } = render(<NodeTitle {...props} />);
  expect(container.getElementsByTagName('input')[0]).toHaveAttribute('value', props.node.title);
  expect(container).toMatchSnapshot();
});

it('calls handler function w/ the current input value on blur event, if value changed', () => {
  const props = {
    node: {
      title: 'test-node',
      id: 'test-node-id',
      type: nodeTypes.FOLDER,
      expanded: true,
      children: [],
    },
    path: ['step1', 'step2'],
    onSubmit: jest.fn(),
  };

  const newName = 'new folder name';

  const { container } = render(<NodeTitle {...props} />);
  const inputEl = container.getElementsByTagName('input')[0];
  inputEl.value = newName;
  fireEvent.blur(inputEl);
  expect(props.onSubmit).toBeCalledTimes(1);
  expect(props.onSubmit).lastCalledWith({ title: newName, node: props.node, path: props.path });
});

it('calls handler function w/ the current input value on submit event, if value changed', () => {
  const props = {
    node: {
      title: 'test-node',
      id: 'test-node-id',
      type: nodeTypes.FOLDER,
      expanded: true,
      children: [],
    },
    path: ['step1', 'step2'],
    onSubmit: jest.fn(),
  };

  const newName = 'different folder name';

  const { container } = render(<NodeTitle {...props} />);
  container.getElementsByTagName('input')[0].value = newName;
  const formEl = container.getElementsByTagName('form')[0];
  fireEvent.submit(formEl);
  expect(props.onSubmit).toBeCalledTimes(1);
  expect(props.onSubmit).lastCalledWith({ title: newName, node: props.node, path: props.path });
});

it('does not call handler function, if value did not change', () => {
  const props = {
    node: {
      title: 'test-node',
      id: 'test-node-id',
      type: nodeTypes.FOLDER,
      expanded: true,
      children: [],
    },
    path: ['step1', 'step2'],
    onSubmit: jest.fn(),
  };

  const { container } = render(<NodeTitle {...props} />);

  const formEl = container.getElementsByTagName('form')[0];
  fireEvent.submit(formEl);
  const inputEl = container.getElementsByTagName('input')[0];
  fireEvent.blur(inputEl);

  expect(props.onSubmit).not.toBeCalled();
});

it('does not propagate click event', () => {
  const props = {
    node: {
      title: 'test-node',
      id: 'test-node-id',
      type: nodeTypes.FOLDER,
      expanded: true,
      children: [],
    },
    path: ['step1', 'step2'],
    onSubmit: jest.fn(),
  };

  const onClickHandler = jest.fn();
  const { container } = render(<div onClick={ onClickHandler }><NodeTitle {...props} /></div>);
  const inputEl = container.getElementsByTagName('input')[0];
  fireEvent.click(inputEl);

  expect(onClickHandler).not.toBeCalled();
});
