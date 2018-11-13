import React from 'react';
import EditorContainer from './EditorContainer';
import Editor from './widgets/Editor';
import Delta from 'quill-delta';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { render, cleanup } from 'react-testing-library';
import 'jest-dom/extend-expect';
import initialState from '../redux/misc/initialState';
import { MutationObserver } from '../test-utils/MutationObserver';
jest.mock('../redux/actions/editorActions');
import { changeContentAction } from '../redux/actions/editorActions';

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
  changeContentAction.mockClear();
});

it('render correctly with proper component and props', () => {
  const delta = new Delta([
    { insert: 'Hello world!' },
  ]);
  const mockedInitialState = {
    ...initialState,
    editorContent: {
      id: 'editor-content-id',
      title: 'mocked content title',
      content: '<p>Hello world!<br></p>',
      delta,
      dateCreated: 1212,
      dateModified: 7878,
      readOnly: false,
    },
  };
  const expectedProps = {
    id: mockedInitialState.editorContent.id,
    title: mockedInitialState.editorContent.title,
    delta: mockedInitialState.editorContent.delta,
    content: mockedInitialState.editorContent.content,
    dateCreated: mockedInitialState.editorContent.dateCreated,
    dateModified: mockedInitialState.editorContent.dateModified,
    readOnly: mockedInitialState.editorContent.readOnly,
  };

  changeContentAction.mockImplementation(() => ({ type: 'DUMMY_ACTION_TYPE', payload: 'DUMMY_PAYLOAD' }));
  const store = createMockStore([thunk])(mockedInitialState);

  const { container } = render(<Provider store={ store }><EditorContainer /></Provider>);
  expect(container).toMatchSnapshot();

  wrapper = shallow(<Provider store={ store }><EditorContainer /></Provider>).dive({ context: { store } });
  expect(wrapper.find(Editor).exists()).toBe(true);
  expect(wrapper.find(Editor).props()).toMatchObject(expectedProps);
});

it('call the proper callback on content change', () => {
  const delta = new Delta([
    { insert: 'Goodnight!' },
  ]);
  const mockedInitialState = {
    ...initialState,
    editorContent: {
      id: 'editor-content-id2',
      title: 'mocked content title',
      content: '<p>Goodnight!<br></p>',
      delta,
      dateCreated: 3434,
      dateModified: 9090,
      readOnly: false,
    },
  };
  const expectedProps = {
    id: mockedInitialState.editorContent.id,
    title: mockedInitialState.editorContent.title,
    delta: mockedInitialState.editorContent.delta,
    content: mockedInitialState.editorContent.content,
    dateCreated: mockedInitialState.editorContent.dateCreated,
    dateModified: mockedInitialState.editorContent.dateModified,
    readOnly: mockedInitialState.editorContent.readOnly,
  };

  changeContentAction.mockImplementation(() => ({ type: 'DUMMY_ACTION_TYPE', payload: 'DUMMY_PAYLOAD' }));
  const store = createMockStore([thunk])(mockedInitialState);

  render(<Provider store={ store }><EditorContainer /></Provider>);
  expect(changeContentAction).toBeCalledTimes(1);
});
