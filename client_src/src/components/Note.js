import React from 'react';
import classnames from 'classnames';

class Note extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.clickHandler(this.props.node);
  }

  render() {
    return (
      <span
        className={ classnames('node', { 'is-active': this.props.active }) }
        onClick={ this.handleClick }
      >
        { this.props.node.module }
      </span>
    );
  }
}

export default Note;
