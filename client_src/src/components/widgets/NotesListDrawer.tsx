import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import NotesList from './NotesList';

function NotesListDrawer({ drawerOpen, handleDrawerToggle, ...otherProps }: any) {
  // const [mobileOpen, setMobileOpen] = React.useState(false);
  // function handleDrawerToggle() {
  //   setMobileOpen(!mobileOpen);
  // }

  return (
    <nav>
      <Hidden smUp implementation="css">
        <Drawer
          variant="temporary"
          anchor="left"
          open={ drawerOpen }
          onClose={ handleDrawerToggle }
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          <NotesList {...otherProps} />
        </Drawer>
      </Hidden>
      <Hidden xsDown implementation="css">
        <Drawer
          variant="permanent"
          open
        >
          <NotesList {...otherProps} />
        </Drawer>
      </Hidden>
    </nav>
  );
}

export default NotesListDrawer;
