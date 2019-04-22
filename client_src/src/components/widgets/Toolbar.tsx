import React from 'react';
import styles from './Toolbar.module.css';
import Tool from './Tool';

// Types
type PropsT = {
  toolsMap: Map<{ label: string, icon: React.ReactNode }, (...args: any) => any>;
}

function Toolbar({ toolsMap }: PropsT) {
  const toolsSet = [];
  for (let [assets, handler] of toolsMap) {
    toolsSet.push(<Tool key={ assets.label } label={ assets.label } onClick={ handler }>{ assets.icon }</Tool>);
  }
  return (
    <div className={ styles.dnt__toolbar } >
      { toolsSet }
    </div>
  );
}

export default Toolbar;
