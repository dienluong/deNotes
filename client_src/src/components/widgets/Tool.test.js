import React from 'react';
import { render, cleanup, fireEvent } from 'react-testing-library';
import 'jest-dom/extend-expect';
import Tool from './Tool';

afterEach(cleanup);

it('renders a button with specified label reacting to click event', () => {
  const clickHandler = jest.fn();
  const label = 'test-tool-label';

  const { queryAllByText } = render(<Tool label={ label } onClick={ clickHandler }/>);
  const elements = queryAllByText(label);
  expect(elements).toHaveLength(1);
  expect(elements[0]).toBeVisible();
  fireEvent.click(elements[0]);
  expect(clickHandler).toBeCalledTimes(1);
});