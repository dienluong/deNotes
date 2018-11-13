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

it('should render quill editor with expected props', () => {
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
    options: {
      placeholder: 'Placeholder text',
    },
  };
  const expectedProps = {
    defaultValue: props.delta,
    readOnly: props.readOnly,
    onChange: contentChangeHandler,
    ...props.options,
  };

  wrapper = shallow(<Editor { ...props } />);
  expect(wrapper.find(ReactQuill).exists()).toBe(true);
  expect(wrapper.find(ReactQuill).props()).toMatchObject(expectedProps);
});
