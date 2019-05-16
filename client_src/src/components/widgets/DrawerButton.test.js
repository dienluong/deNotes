import React from 'react';
import DrawerButton from './DrawerButton';
import Fab from '@material-ui/core/Fab';
import MenuIcon from '@material-ui/icons/Menu';
import Zoom from '@material-ui/core/Zoom';

// Configure Enzyme
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });
let wrapper = {};

afterEach(() => {
  if (typeof wrapper.unmount === 'function') {
    wrapper.unmount();
  }
});

it('should render button with material-ui Zoom and Fab components', () => {
  const clickHandler = jest.fn();
  const props = {
    size: 'small',
    visible: true,
    clickHandler,
    className: 'some-css-class',
  };

  wrapper = shallow(<DrawerButton { ...props } />);
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.find(Zoom).exists()).toBe(true);
  expect(wrapper.find(Zoom).prop('in')).toBe(props.visible);
  expect(wrapper.find(Fab).exists()).toBe(true);
  expect(wrapper.find(Fab).prop('size')).toBe(props.size);
  expect(wrapper.find(MenuIcon).exists()).toBe(true);
});

it('should react to click by invoking handler function', () => {
  const clickHandler = jest.fn();
  const props = {
    size: 'small',
    visible: true,
    clickHandler,
    className: 'some-css-class',
  };

  wrapper = shallow(<DrawerButton { ...props } />);
  wrapper.find(Fab).simulate('click');
  expect(clickHandler).toBeCalledTimes(1);
});
