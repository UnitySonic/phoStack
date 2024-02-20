import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

const ReasonConfirmModal = ({ open, handleClose, handleConfirm }) => {
  const [reason, setReason] = useState('');

  const handleReasonChange = (event) => {
    setReason(event.target.value);
  };

  const handleConfirmAction = () => {
    handleConfirm(reason);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Confirmation</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          label="Reason"
          value={reason}
          onChange={handleReasonChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleConfirmAction}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReasonConfirmModal;
