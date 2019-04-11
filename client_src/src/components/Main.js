import React from 'react';
import './Main.css';
import styles from './Main.module.css';
import EditorContainer from './EditorContainer';
import NotesListContainer from './NotesListContainer';
import Paper from '@material-ui/core/Paper';
import DrawerButton from './widgets/DrawerButton';

const editorParams = {
  options: { placeholder: 'Welcome to deNotes! v0.02' },
};

function Main() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  function handleDrawerToggle() {
    //TODO remove
    console.log('DRAWER]]]]]]]]]] ', drawerOpen);
    setDrawerOpen(!drawerOpen);
  }
  return (
    // <React.StrictMode>
    <Paper elevation={ 1 }>
      <DrawerButton className={ styles['dnt__notes-list-drawer-btn'] } visible={ !drawerOpen } clickHandler={ handleDrawerToggle } />
      <NotesListContainer drawerOpen={ drawerOpen } handleDrawerToogle={ handleDrawerToggle } />
      <EditorContainer options={ editorParams.options } />
    </Paper>
    // </React.StrictMode>
  );
}

export default Main;
