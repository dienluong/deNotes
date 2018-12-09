import React from 'react';

// Types
type PropsT = {
  className: string;
  label: string;
  onClick: (params: any) => any;
}

function PathSegment({ className, label, onClick: clickCallback }: PropsT) {
  return (
    <li className={ className } onClick={ clickCallback }><span>{ label }&gt;</span></li>
  );
}

export default PathSegment;
