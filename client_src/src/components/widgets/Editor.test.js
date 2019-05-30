import React from 'react';
import Editor from './Editor';
import Delta from 'quill-delta';
import ReactQuill from 'react-quill';
import { MutationObserver } from '../../test-utils/MutationObserver';

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
});

it('should render quill editor w/ default snow theme and w/ expected props', () => {
  const delta = new Delta([
    { insert: 'Hello world!' },
  ]);
  const contentChangeHandler = jest.fn();
  const props = {
    id: 'editor-content-id',
    title: 'mocked content title',
    content: '<p>Hello world!<br></p>',
    delta,
    dateCreated: 565656,
    dateModified: 898989,
    readOnly: false,
    contentChangeHandler,
    minimalist: false,
    options: {
      placeholder: 'Placeholder text',
    },
  };
  const expectedProps = {
    defaultValue: props.delta,
    onChange: contentChangeHandler,
    theme: 'snow',
    readOnly: props.readOnly,
    ...props.options,
  };

  wrapper = shallow(<Editor { ...props } />);
  expect(wrapper.find(ReactQuill).exists()).toBe(true);
  expect(wrapper.find(ReactQuill).props()).toMatchObject(expectedProps);
  expect(wrapper.find('LargeEditorToolbar').exists()).toBe(true);
});

it('should render minimalist editor w/ bubble theme but without toolbar', () => {
  const delta = new Delta([
    { insert: 'Hello world!' },
  ]);
  const contentChangeHandler = jest.fn();
  const props = {
    id: 'editor-content-id',
    title: 'mocked content title',
    content: '<p>Hello world!<br></p>',
    delta,
    dateCreated: 565656,
    dateModified: 898989,
    readOnly: false,
    contentChangeHandler,
    minimalist: true,
    options: {
      placeholder: 'Placeholder text',
    },
  };
  const expectedProps = {
    defaultValue: props.delta,
    onChange: contentChangeHandler,
    theme: 'bubble',
    readOnly: props.readOnly,
    ...props.options,
  };

  wrapper = shallow(<Editor { ...props } />);
  expect(wrapper.find(ReactQuill).exists()).toBe(true);
  expect(wrapper.find(ReactQuill).props()).toMatchObject(expectedProps);
  expect(wrapper.find('LargeEditorToolbar').exists()).toBe(false);
  expect(wrapper.find('div#dnt__editor-toolbar').exists()).toBe(true);
  expect(wrapper.find('div#dnt__editor-toolbar').children()).toHaveLength(0);
});
