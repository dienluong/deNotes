import React from 'react';
import styles from './Main.module.css';
import EditorContainer from './EditorContainer';
import NotesListContainer from './NotesListContainer';
import Paper from '@material-ui/core/Paper';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';
import DrawerButton from './widgets/DrawerButton';

const editorParams = {
  options: { placeholder: 'Welcome to deNotes! v0.02' },
  minimalist: false,
};

function Main() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  function handleDrawerToggle() {
    setDrawerOpen(!drawerOpen);
  }
  const smallMedia = useMediaQuery('(max-width:600px)');
  let drawerButtonSize;
  if (smallMedia) {
    editorParams.minimalist = true;
    drawerButtonSize = 'small';
  } else {
    editorParams.minimalist = false;
    drawerButtonSize = 'medium';
  }

  return (
    // <React.StrictMode>
    <div className={ styles['dnt__main-root'] }>
      <main className={ styles['dnt__main-editor'] }>
        <Paper elevation={ 1 } >
          <EditorContainer options={ editorParams.options } minimalist={ editorParams.minimalist } />
        </Paper>
      </main>
      <nav className={ styles['dnt__main-nav'] }>
        <NotesListContainer drawerOpen={ drawerOpen } drawerSide={ 'left' } handleDrawerToggle={ handleDrawerToggle } />
      </nav>
      <DrawerButton className={ styles['dnt__main-nav-btn'] } size={ drawerButtonSize } visible={ !drawerOpen } clickHandler={ handleDrawerToggle } />
    </div>
    // </React.StrictMode>
  );
}

export default Main;
