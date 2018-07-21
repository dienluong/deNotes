import React from 'react';
import PathSegment from './PathSegment';
import './PathNavigator.css';

class PathNavigator extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(idx, label) {
    // console.log(`segment clicked: ${label}`);
    this.props.clickHandler(idx, label);
  }

  render() {
    const path = this.props.path.length ?
      this.props.path.map((step, idx) => <PathSegment className='lined' key={ idx } index={ idx } onClick={ this.handleClick } label={ step } />) : [];

    return (
      <nav>
        <ul>
          <PathSegment className='lined' onClick={ this.handleClick } label='' />
          { path }
        </ul>
      </nav>
    );
  }
}

export default PathNavigator;
