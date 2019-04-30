import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import NotesList from './NotesList';
import styles from './NotesListDrawer.module.css';

// Types
import { PropsT as NotestListPropsT } from './NotesList';
type PropsT = {
  drawerOpen: boolean,
  drawerSide: 'left' | 'right',
  handleDrawerToggle: () => void,
}

function NotesListDrawer({ drawerOpen, drawerSide, handleDrawerToggle, ...otherProps }: PropsT & NotestListPropsT) {
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
            paper: styles['dnt__notes-list-drawer-paper'],
          }}
        >
          <NotesList { ...otherProps } />
        </Drawer>
      </Hidden>
      <Hidden smDown implementation="css">
        <Drawer
          variant="permanent"
          anchor={ drawerSide }
          open
          classes={{
            paper: styles['dnt__notes-list-drawer-paper'],
          }}
        >
          <NotesList { ...otherProps } />
        </Drawer>
      </Hidden>
    </React.Fragment>
  );
}

export default NotesListDrawer;
