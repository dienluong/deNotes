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
  onCloseHandler: ({ value }: { value: string }) => unknown;
};

export default function RenameNodeModal({ nodeType, currentName, onCloseHandler }: PropsT) {
  const [open, setOpen] = React.useState(true);
  let textFieldValue = '';

  function handleClose() {
    setOpen(false);
    // TODO: Trim whitespaces
    onCloseHandler({ value: textFieldValue });
  }

  function handleChange(event: ChangeEvent<HTMLInputElement> ) {
    textFieldValue = event.target.value;
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    handleClose();
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
          <Button onClick={ handleClose } color="primary">
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
