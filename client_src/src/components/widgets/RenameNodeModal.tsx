import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

// Types
import { FormEvent, ChangeEvent } from 'react';
type PropsT = {
  nodeType: NodeTypeT,
  currentName: string,
  onCloseHandler: () => unknown;
  onSubmitHandler: ({ name }: { name: string }) => unknown;
};

export default function RenameNodeModal({ currentName, onCloseHandler, onSubmitHandler }: PropsT) {
  const [open, setOpen] = React.useState(true);
  let textFieldValue = '';

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
        <DialogTitle id="rename-node-dialog-title">{ `Rename ${currentName}` }</DialogTitle>
        <DialogContent>
          <form onSubmit={ submit } noValidate autoComplete="off">
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="New Name"
              type="text"
              required
              fullWidth
              variant="outlined"
              defaultValue={ currentName }
              onChange={ handleChange }
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={ submit } color="primary">
            OK
          </Button>
          <Button onClick={ handleClose } color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
