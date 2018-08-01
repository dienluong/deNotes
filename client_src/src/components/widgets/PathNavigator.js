import React from 'react';
import PathSegment from './PathSegment';
import './PathNavigator.css';

function PathNavigator({ path, activeSegmentIdx, onClick: clickHandler }) {
  const pathSegments = path.length ?
    path.map((step, idx) =>
      <PathSegment
        className={ 'lined' + (idx === activeSegmentIdx ? ' active-segment' : '') }
        key={ idx }
        label={ step }
        onClick={ () => clickHandler({ idx }) }
      />) :
    [];

  return (
    <nav>
      <ul>
        { pathSegments }
      </ul>
    </nav>
  );
}

export default PathNavigator;
