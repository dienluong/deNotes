import React from 'react';

class Note extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.clickHandler(this.props.node);
  }

  render() {
    // console.log(`rendering node ${this.props.node.module}`);
    // const className = classnames('node', { 'is-active': this.props.active });
    const className = 'node' + (this.props.active ? ' is-active' : '');
    return (
      <span
        className={ className }
        onClick={ this.handleClick }
      >
        { this.props.node.module }
      </span>
    );
  }
}

export default Note;
