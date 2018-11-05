import React from 'react';
import PathSegment from './PathSegment';
import './PathNavigator.css';

function PathNavigator({ path, activeSegmentIdx, onClick: clickHandler }) {
  const pathSegments = path.length ?
    path.map((step, idx) =>
      <PathSegment
        className={ 'lined' + (idx === activeSegmentIdx ? ' dnt__pathnav-segment--active' : '') }
        key={ idx }
        label={ step }
        onClick={ () => clickHandler({ idx }) }
      />) :
    [];

  return (
    <nav className={'dnt__pathnav'}>
      <ul>
        { pathSegments }
      </ul>
    </nav>
  );
}

export default PathNavigator;
