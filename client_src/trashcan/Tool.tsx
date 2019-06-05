import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import styles from './Tool.module.css';

// Types
type PropsT = {
  label: string;
  onClick: (...args: any) => any;
  children: React.ReactNode;
}

function Tool({ label, onClick: clickHandler, children }: PropsT) {
  return (
    <IconButton className={ styles.dnt__toolBtn } aria-label={ label } color="primary" onClick={ clickHandler }>{ children }</IconButton>
  );
}

export default Tool;
