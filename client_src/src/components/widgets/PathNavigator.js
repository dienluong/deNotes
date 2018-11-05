import React from 'react';
import PathSegment from './PathSegment';
import styles from './PathNavigator.module.css';

function PathNavigator({ path, activeSegmentIdx, onClick: clickHandler }) {
  const pathSegments = path.length ?
    path.map((step, idx) =>
      <PathSegment
        className={ styles.lined + (idx === activeSegmentIdx ? ' ' + styles['dnt__pathnav-segment--active'] : '') }
        key={ idx }
        label={ step }
        onClick={ () => clickHandler({ idx }) }
      />) :
    [];

  return (
    <nav className={ styles.dnt__pathnav }>
      <ul>
        { pathSegments }
      </ul>
    </nav>
  );
}

export default PathNavigator;
