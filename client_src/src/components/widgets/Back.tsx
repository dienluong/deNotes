import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import styles from './Back.module.css';

// Types
type PropsT = {
  activeSegmentIdx: number;
  label: string;
  onClick: ({ idx }: { idx: number }) => any;
  children: React.ReactNode;
}

function Back({ activeSegmentIdx, children, label, onClick: clickHandler }: PropsT) {
  function onClickCb() {
    if (activeSegmentIdx >= 0) {
      clickHandler({ idx: activeSegmentIdx - 1 });
    } else {
      clickHandler({ idx: 0 });
    }
  }

  return (
    <IconButton className={ styles.dnt__backBtn } aria-label={ label } color="primary" onClick={ onClickCb }>{ children }</IconButton>
  );
}

export default Back;
