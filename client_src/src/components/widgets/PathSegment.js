import React from 'react';

class PathSegment extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.props.onClick(this.props.index, this.props.label);
  }

  render() {
    return (
      <li className={ this.props.className } onClick={ this.handleClick }><span>{ this.props.label } &gt;</span></li>
    );
  }
}

export default PathSegment;
