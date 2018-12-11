import React from 'react';
import styles from './NodeTitle.module.css';

// Types
import { FormEvent } from 'react';
type PropsT<P> = {
  node: TreeNodeT,
  path: P,
  onSubmit: (params: { title: any, node: TreeNodeT, path: P }) => unknown,
};

function NodeTitle({ node, path, onSubmit: submitHandler }: PropsT<any>) {
  function submit(event: FormEvent<HTMLElement>) {
    // event.currentTarget is <input> if the event was onBlur
    // but event.currentTarget is *not* <input>, but rather <form>, if the event was onSubmit
    const inputEl = event.currentTarget.matches('input') ? event.currentTarget : event.currentTarget.getElementsByTagName('input')[0];
    if (inputEl instanceof HTMLInputElement) {
      // TODO: Sanitize the value!
      if (inputEl.value !== inputEl.defaultValue) {
        submitHandler({
          title: inputEl.value,
          node: node,
          path: path,
        });
      }
    }
    event.preventDefault();
  }

  return (
    <form onSubmit={ submit } >
      <input
        className={ styles['dnt__node-title'] }
        type="text"
        defaultValue={ node.title }
        onBlur={ submit }
      />
    </form>
  );
}

export default NodeTitle;
