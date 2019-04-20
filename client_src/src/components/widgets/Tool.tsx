import React from 'react';
import Button from '@material-ui/core/Button';
import styles from './Tool.module.css';

// Types
type PropsT = {
  label: string;
  onClick: (params: any) => any;
}

function Tool({ label, onClick: clickHandler }: PropsT) {
  return (
    <Button className={ styles.dnt__toolBtn } color="primary" onClick={ clickHandler }>{ label }</Button>
  );
}

export default Tool;
