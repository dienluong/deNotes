import React from 'react';

function Tool({ label, onClick: clickHandler }) {
  return (
    <button onClick={ clickHandler }>{ label }</button>
  );
}

export default Tool;
