import React from 'react';

class NoteTitle extends React.Component {
  constructor(props) {
    super(props);
    // this.input = React.createRef();
    this.submit = this.submit.bind(this);
  }

  submit(event) {
    const inputEl = event.target.matches('input') ? event.target : event.target.firstElementChild;
    // console.log(';' + inputEl.value + ';' + inputEl.defaultValue + ';');
    if (inputEl.value !== inputEl.defaultValue) {
      this.props.submitHandler({
        // title: this.input.current.value,
        title: inputEl.value,
        node: this.props.node,
        path: this.props.path,
      });
    }
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={ this.submit } onBlur={ this.submit }>
        <input className='note-title'
          type="text"
          defaultValue={ this.props.node.title }
          // ref={ this.input }
        />
      </form>
    );
  }
}

export default NoteTitle;
