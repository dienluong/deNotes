import React from 'react';
import unescape from 'lodash/unescape';

// Types
type PropsT = {
  className: string;
  label: string;
  onClick: (params: any) => any;
}

function PathSegment({ className, label, onClick: clickCallback }: PropsT) {
  return (
    <li className={ className } onClick={ clickCallback }><span>{ unescape(label) }&gt;</span></li>
  );
}

export default PathSegment;
