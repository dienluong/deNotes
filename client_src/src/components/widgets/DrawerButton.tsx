import React from 'react';
import Fab from '@material-ui/core/Fab';
import MenuIcon from '@material-ui/icons/Menu';
import Zoom from '@material-ui/core/Zoom';

function DrawerButton({ visible, clickHandler, className }: { visible: boolean, clickHandler: () => unknown, className: string }) {
  return (
    <div className={ className }>
      <Zoom in={ visible } unmountOnExit>
        <Fab aria-label="notes list drawer" onClick={ clickHandler }>
          <MenuIcon />
        </Fab>
      </Zoom>
    </div>
  );
}

export default DrawerButton;
