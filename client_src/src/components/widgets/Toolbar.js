import React from 'react';
import styles from './Toolbar.module.css';
import Tool from './Tool';

function Toolbar({ toolsMap }) {
  const toolsSet = [];
  for (let [label, handler] of toolsMap) {
    toolsSet.push(<Tool key={ label } label={ label } onClick={ handler }/>);
  }
  return (
    <div className={ styles.dnt__toolbar } >
      { toolsSet }
    </div>
  );
}

export default Toolbar;

// TODO: add proptypes
