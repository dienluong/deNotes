import React from 'react';

class NoteTitle extends React.Component {
  constructor(props) {
    super(props);
    this.input = React.createRef();
  }

  render() {
    return (
      <form
        onSubmit={ event => {
          this.props.submitHandler(this.input.current.value, this.props.node, this.props.path);
          event.preventDefault();
        }}
      >
        <input
          type="text"
          defaultValue={ this.props.node.title }
          ref={ this.input }
        />
      </form>
    );
  }
}

export default NoteTitle;
