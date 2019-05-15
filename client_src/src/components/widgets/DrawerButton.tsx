import React from 'react';
import Fab from '@material-ui/core/Fab';
import MenuIcon from '@material-ui/icons/Menu';
import Zoom from '@material-ui/core/Zoom';

// Types
import { FabProps } from '@material-ui/core/Fab';

function DrawerButton({ size, visible, clickHandler, className }: { size: FabProps['size'], visible: boolean, clickHandler: () => unknown, className: string }) {
  return (
    <div className={ className }>
      <Zoom in={ visible } unmountOnExit>
        <Fab size={ size } color="primary" aria-label="notes list drawer" onClick={ clickHandler }>
          <MenuIcon />
        </Fab>
      </Zoom>
    </div>
  );
}

export default DrawerButton;
