import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import styles from './Back.module.css';

// Types
type PropsT = {
  label: string;
  onClick: (...args: any) => any;
  children: React.ReactNode;
}

function Back({ children, label, onClick: clickHandler }: PropsT) {
  return (
    <IconButton className={ styles.dnt__backBtn } aria-label={ label } color="primary" onClick={ clickHandler }>{ children }</IconButton>
  );
}

export default Back;
