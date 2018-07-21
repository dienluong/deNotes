import React from 'react';

function NoteTitle({ node, path, onSubmit: submitHandler }) {
  function submit(event) {
    const inputEl = event.target.matches('input') ? event.target : event.target.firstElementChild;
    // console.log(';' + inputEl.value + ';' + inputEl.defaultValue + ';');
    if (inputEl.value !== inputEl.defaultValue) {
      submitHandler({
        // title: this.input.current.value,
        title: inputEl.value,
        node: node,
        path: path,
      });
    }
    event.preventDefault();
  }

  return (
    <form onSubmit={ submit } onBlur={ submit }>
      <input
        className='note-title'
        type="text"
        defaultValue={ node.title }
        // ref={ this.input }
      />
    </form>
  );
}

export default NoteTitle;
