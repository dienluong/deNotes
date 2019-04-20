import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import NotesList from './NotesList';
import styles from './NotesListDrawer.module.css';

function NotesListDrawer({ drawerOpen, handleDrawerToggle, ...otherProps }: any) {
  // const [mobileOpen, setMobileOpen] = React.useState(false);
  // function handleDrawerToggle() {
  //   setMobileOpen(!mobileOpen);
  // }

  return (
    <React.Fragment>
      <Hidden mdUp implementation="css">
        <Drawer
          variant="temporary"
          anchor="right"
          open={ drawerOpen }
          onClose={ handleDrawerToggle }
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          classes={{
            paper: styles['dnt__notes-list-drawer-paper'],
          }}
        >
          <NotesList {...otherProps} />
        </Drawer>
      </Hidden>
      <Hidden smDown implementation="css">
        <Drawer
          variant="permanent"
          anchor="right"
          open
          classes={{
            paper: styles['dnt__notes-list-drawer-paper'],
          }}
        >
          <NotesList {...otherProps} />
        </Drawer>
      </Hidden>
    </React.Fragment>
  );
}

export default NotesListDrawer;
