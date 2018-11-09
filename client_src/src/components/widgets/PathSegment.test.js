import PathSegment from './PathSegment';
import React from 'react';
import { render, cleanup, fireEvent } from 'react-testing-library';
import 'jest-dom/extend-expect';

afterEach(cleanup);

it('renders an element with a label and reacting to a click event', () => {
  const props = {
    className: 'test-css-class',
    label: 'test-segment-label',
    onClick: jest.fn(),
  };

  const { queryAllByText, container } = render(<PathSegment { ...props } />);
  expect(container).toMatchSnapshot();
  const elements = queryAllByText(props.label, { exact: false });
  expect(elements).toHaveLength(1);
  expect(container.firstChild).toHaveClass(props.className);
  fireEvent.click(container.firstChild);
  expect(props.onClick).toBeCalledTimes(1);
});
