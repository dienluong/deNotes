import React from 'react';
import styles from './NodeTitle.module.css';
import escape from 'lodash/escape';
import unescape from 'lodash/unescape';

// Types
import { FormEvent } from 'react';
type PropsT<N,P> = {
  node: N,
  path: P,
  onSubmit: (params: { title: string, node: N, path: P }) => unknown,
};

function NodeTitle({ node, path, onSubmit: submitHandler }: PropsT<TreeNodeT, any>) {
  const inputRef = React.createRef<HTMLInputElement>();
  function submit(event: FormEvent<HTMLElement>) {
    const inputEl = inputRef.current;
    if (inputEl instanceof HTMLInputElement) {
      inputEl.blur();
      const escapedInput = escape(inputEl.value);
      if (escapedInput !== inputEl.defaultValue) {
        submitHandler({
          title: escapedInput,
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
        ref={ inputRef }
        className={ styles['dnt__node-title'] }
        type="text"
        defaultValue={ unescape(node.title) }
        onBlur={ submit }
        onClick={ event => event.stopPropagation() }
        onDoubleClick={ event => event.stopPropagation() }
      />
    </form>
  );
}

export default NodeTitle;
