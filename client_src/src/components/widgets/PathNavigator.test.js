import PathNavigator from './PathNavigator';
import React from 'react';
import { render, cleanup, fireEvent } from 'react-testing-library';
import 'jest-dom/extend-expect';
const ACTIVE_SEGMENT_CLASS = 'active-segment';

afterEach(cleanup);

it('renders an element composed of segments w/ labels and with specified segment as "active"', () => {
  const props = {
    path: ['label1', 'label2', 'label3'],
    onClick: jest.fn(),
    activeSegmentIdx: 1,
  };

  const { queryAllByText, container } = render(<PathNavigator { ...props } />);

  // expect rendered component to have all specified labels
  props.path.forEach(label => expect(queryAllByText(label, { exact: false })).toHaveLength(1));

  // expect one segment as active
  const activeSegment = container.getElementsByClassName(ACTIVE_SEGMENT_CLASS);
  expect(activeSegment).toHaveLength(1);
  expect(activeSegment[0]).toHaveTextContent(props.path[props.activeSegmentIdx]);
});

it('each segment of rendered component reacts to click event', () => {
  const props = {
    path: ['label1', 'label2', 'label3'],
    onClick: jest.fn(),
    activeSegmentIdx: 1,
  };

  const { queryAllByText } = render(<PathNavigator { ...props } />);
  const allSegments = queryAllByText(/label/);

  // click on each of the segments
  allSegments.forEach((seg, idx) => {
    fireEvent.click(seg);
    expect(props.onClick).lastCalledWith({ idx });
  });

  expect(props.onClick).toBeCalledTimes(props.path.length);
});
