import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import MuiToolbar from '@material-ui/core/Toolbar';
import styles from './Toolbar.module.css';
import Tool from './Tool';

// Types
type PropsT = {
  toolsMap: Map<{ label: string, icon: React.ReactNode }, (...args: any) => any>;
  className: string;
  [key: string]: any;
}

function Toolbar({ toolsMap, className, ...otherProps }: PropsT) {
  const toolsSet = [];
  for (let [assets, handler] of toolsMap) {
    toolsSet.push(<Tool key={ assets.label } label={ assets.label } onClick={ handler }>{ assets.icon }</Tool>);
  }
  return (
    <AppBar { ...otherProps }>
      <MuiToolbar className={ `${className} ${styles.dnt__toolbar}` } >
        { toolsSet }
      </MuiToolbar>
    </AppBar>
  );
}

export default Toolbar;
