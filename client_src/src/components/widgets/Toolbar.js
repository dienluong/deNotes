import React, { Fragment } from 'react';
import Tool from './Tool';

function Toolbar({ toolsMap }) {
  const toolsSet = [];
  for (let [label, handler] of toolsMap) {
    toolsSet.push(<Tool key={label} label={label} onClick={ handler }/>);
  }
  return (
    <Fragment>
      { toolsSet }
    </Fragment>
  );
}

export default Toolbar;

// TODO: add proptypes
