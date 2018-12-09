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
    // event.target is <input> if the event was onBlur
    // but event.target is *not* <input>, but rather <form>, if the event was onSubmit
    // @ts-ignore
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
        className={ styles['dnt__node-title'] }
        type="text"
        defaultValue={ node.title }
      />
    </form>
  );
}

export default NodeTitle;
