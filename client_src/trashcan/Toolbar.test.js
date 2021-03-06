import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import 'jest-dom/extend-expect';
import Toolbar from './Toolbar';

afterEach(cleanup);

it('renders a group of tools from list of labels and handlers received', () => {
  const tools = new Map();
  const numButtons = 3;
  const labelPrefix = 'tool';

  for (let i = 1; i <= numButtons; i += 1) {
    tools.set(`${labelPrefix} ${i}`, jest.fn());
  }

  const { queryAllByText, container } = render(<Toolbar toolsMap={ tools } />);
  expect(container).toMatchSnapshot();
  tools.forEach((ignore, key) => expect(queryAllByText(key)).toHaveLength(1));

  const buttons = queryAllByText(labelPrefix, { exact: false });
  expect(buttons).toHaveLength(3);
  buttons.forEach(b => fireEvent.click(b));
  tools.forEach(handler => expect(handler).toBeCalledTimes(1));
});
