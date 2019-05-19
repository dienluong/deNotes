import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import NotesList from './NotesList';
import styles from './NotesListDrawer.module.css';

// Types
import { PropsT as NotesListPropsT } from './NotesList';
type PropsT = {
  drawerOpen: boolean,
  drawerSide: 'left' | 'right',
  size: 'small' | 'medium',
  handleDrawerToggle: () => void,
}

function NotesListDrawer({ drawerOpen, drawerSide, size, handleDrawerToggle, ...otherProps }: PropsT & NotesListPropsT) {
  return (
    <React.Fragment>
      <Hidden mdUp implementation="css">
        <Drawer
          variant="temporary"
          anchor={ drawerSide }
          open={ drawerOpen }
          onClose={ handleDrawerToggle }
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          classes={{
            paper: size !== 'small' ? styles['dnt__notes-list-drawer-paper'] : styles['dnt__notes-list-drawer-paper--small'],
          }}
        >
          <NotesList { ...{size, ...otherProps} } />
        </Drawer>
      </Hidden>
    </React.Fragment>
  );
}

export default NotesListDrawer;
