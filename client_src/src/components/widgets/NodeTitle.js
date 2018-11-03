import React from 'react';

function NodeTitle({ node, path, onSubmit: submitHandler }) {
  function submit(event) {
    // event.target is <input> if the event was onBlur
    // but event.target is *not* <input>, but rather <form>, if the event was onSubmit
    const inputEl = event.target.matches('input') ? event.target : event.target.getElementsByTagName('input')[0];
    // TODO: Sanitize the value!
    if (inputEl.value !== inputEl.defaultValue) {
      submitHandler({
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
        className='node-title'
        type="text"
        defaultValue={ node.title }
      />
    </form>
  );
}

export default NodeTitle;
