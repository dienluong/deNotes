import React from 'react';
import PathSegment from './PathSegment';
import './PathNavigator.css';

function PathNavigator({ path, onClick: clickHandler }) {
  const pathSegments = path.length ?
    path.map((step, idx) =>
      <PathSegment
        className='lined'
        key={ idx }
        label={ step }
        onClick={ () => clickHandler({ idx }) }
      />) :
    [];

  return (
    <nav>
      <ul>
        <PathSegment className='lined' onClick={ clickHandler } label='' />
        { pathSegments }
      </ul>
    </nav>
  );
}

export default PathNavigator;
