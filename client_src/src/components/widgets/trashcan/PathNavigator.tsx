import React from 'react';
import PathSegment from './PathSegment';
import styles from './PathNavigator.module.css';

// Types
type PropsT = {
  path: string[];
  activeSegmentIdx: number;
  onClick: (params: { idx: number }) => any;
}

function PathNavigator({ path, activeSegmentIdx, onClick: clickHandler }: PropsT) {
  const pathSegments = path.length ?
    path.map((step, idx) =>
      <PathSegment
        className={ styles.lined + ' ' + (idx === activeSegmentIdx ? styles['dnt__pathnav-segment--active'] : styles['dnt__pathnav-segment']) }
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
