import React from 'react';
import Drawer from '@material-ui/core/Drawer';
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
  // NotesList's Edit Mode state using React hooks
  const [editMode, setEditMode] = React.useState(false);

  function onCloseHandler() {
    setEditMode(false);
    handleDrawerToggle();
  }

  return (
    <React.Fragment>
        <Drawer
          variant="temporary"
          anchor={ drawerSide }
          open={ drawerOpen }
          onClose={ onCloseHandler }
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          classes={{
            paper: size !== 'small' ? styles['dnt__notes-list-drawer-paper'] : styles['dnt__notes-list-drawer-paper--small'],
          }}
        >
          <NotesList size={ size } editMode={ editMode } setEditMode={ setEditMode } { ...otherProps } />
        </Drawer>
    </React.Fragment>
  );
}

export default NotesListDrawer;
