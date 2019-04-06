import React from 'react';
import Fab from '@material-ui/core/Fab';
import MenuIcon from '@material-ui/icons/Menu';
import Zoom from '@material-ui/core/Zoom';

function DrawerButton({ visible, clickHandler }: { visible: boolean, clickHandler: () => unknown }) {
  return (
    <Zoom in={ visible } unmountOnExit>
      <Fab aria-label="notes list drawer" onClick={ clickHandler }>
        <MenuIcon />
      </Fab>
    </Zoom>
  );
}

export default DrawerButton;
