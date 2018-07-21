import React from 'react';

function PathSegment({ label, index, className, onClick: clickCallback }) {
  function handleClick() {
    clickCallback(index, label);
  }

  return (
    <li className={ className } onClick={ handleClick }><span>{ label } &gt;</span></li>
  );
}

export default PathSegment;
