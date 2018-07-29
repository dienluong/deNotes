import React from 'react';

function PathSegment({ className, label, onClick: clickCallback }) {
  return (
    <li className={ className } onClick={ clickCallback }><span>{ label } &gt;</span></li>
  );
}

export default PathSegment;
