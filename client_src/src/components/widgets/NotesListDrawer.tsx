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

  // TODO remove
  console.log('drawerOpen]]]]] ', drawerOpen);

  return (
    <div className={ styles['dnt__notes-list-drawer-root'] }>
    <nav className={ styles['dnt__notes-list-drawer'] }>
      <Hidden smUp implementation="css">
        <Drawer
          variant="temporary"
          anchor="left"
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
      <Hidden xsDown implementation="css">
        <Drawer
          variant="permanent"
          anchor="left"
          open
          classes={{
            paper: styles['dnt__notes-list-drawer-paper'],
          }}
        >
          <NotesList {...otherProps} />
        </Drawer>
      </Hidden>
    </nav>
    </div>
  );
}

export default NotesListDrawer;
