import React from 'react';
import styles from './Tool.module.css';

function Tool({ label, onClick: clickHandler }) {
  return (
    <button className={ styles.dnt__tool } onClick={ clickHandler }>{ label }</button>
  );
}

export default Tool;
