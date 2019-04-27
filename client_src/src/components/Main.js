import React from 'react';
import styles from './Main.module.css';
import EditorContainer from './EditorContainer';
import NotesListContainer from './NotesListContainer';
import Paper from '@material-ui/core/Paper';
import Hidden from '@material-ui/core/Hidden';
import DrawerButton from './widgets/DrawerButton';

const editorParams = {
  options: { placeholder: 'Welcome to deNotes! v0.02' },
};

function Main() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  function handleDrawerToggle() {
    setDrawerOpen(!drawerOpen);
  }
  return (
    // <React.StrictMode>
    <div className={ styles['dnt__main-root'] }>
      <main className={ styles['dnt__main-editor'] }>
        <Paper elevation={ 1 } >
          <EditorContainer options={ editorParams.options } />
        </Paper>
      </main>
      <nav className={ styles['dnt__main-nav'] }>
        <NotesListContainer drawerOpen={ drawerOpen } handleDrawerToggle={ handleDrawerToggle } />
      </nav>
      <Hidden className={ styles['dnt__main-nav-btn'] } mdUp implementation="css">
        <DrawerButton visible={ !drawerOpen } clickHandler={ handleDrawerToggle } />
      </Hidden>
    </div>
    // </React.StrictMode>
  );
}

export default Main;
