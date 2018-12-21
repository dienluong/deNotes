import React from 'react';
import styles from './Tool.module.css';

// Types
type PropsT = {
  label: string;
  onClick: (params: any) => any;
}

function Tool({ label, onClick: clickHandler }: PropsT) {
  return (
    <button className={ styles.dnt__tool } onClick={ clickHandler }>{ label }</button>
  );
}

export default Tool;
