import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

// Types
import { FormEvent, ChangeEvent } from 'react';
export type PropsT = {
  nodeType: NodeTypeT,
  currentName: string,
  onCloseHandler: () => unknown;
  onSubmitHandler: ({ name }: { name: string }) => unknown;
};

export default function RenameNodeModal({ currentName, onCloseHandler, onSubmitHandler }: PropsT) {
  const [open, setOpen] = React.useState(true);
  let textFieldValue = currentName;

  function handleClose() {
    setOpen(false);
    if (typeof onCloseHandler === 'function') {
      onCloseHandler();
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement> ) {
    textFieldValue = event.target.value;
  }

  function submit(event: FormEvent<HTMLElement>) {
    handleClose();
    // TODO: Trim whitespaces
    if (typeof onSubmitHandler === 'function') {
      onSubmitHandler({ name: textFieldValue });
    }
    event.preventDefault();
  }

  return (
    <div>
      <Dialog
        open={ open }
        onClose={ handleClose }
        aria-labelledby="rename-node-dialog-title"
      >
        <DialogTitle id="rename-node-dialog-title">{ `Enter Name for ${currentName}` }</DialogTitle>
        <DialogContent>
          <form onSubmit={ submit } noValidate autoComplete="off">
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Name"
              type="text"
              required
              fullWidth
              variant="outlined"
              defaultValue={ currentName }
              onChange={ handleChange }
              onFocus={ (e: React.FocusEvent<HTMLInputElement>) => e.target.select() }
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button aria-label={ 'Cancel Rename Dialog' } onClick={ handleClose } color="primary">
            Cancel
          </Button>
          <Button aria-label={ 'OK Rename Dialog' } onClick={ submit } color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
