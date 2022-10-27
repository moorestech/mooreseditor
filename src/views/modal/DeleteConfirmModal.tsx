import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import React from "react";

const DeleteConfirmModal = (props: { isOpen: boolean, onClose: (isDelete: boolean) => void }) => {
  return (
    <Dialog
      fullWidth
      maxWidth='md'
      scroll='body'
      onClose={() => props.onClose(false)}
      onBackdropClick={() => props.onClose(false)}
      open={props.isOpen}
    >
      <DialogContent sx={{px: 15, py: 15, pt: 8}}>
        <Grid container spacing={6}>
          <Grid item sm={12} sx={{textAlign: 'center'}}>
            <Typography variant='h4'>
              Do you really want to delete this?
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{justifyContent: 'center', pb: 8}}>
        <Button variant='outlined' color='secondary' onClick={() => props.onClose(true)}>
          Yes
        </Button>
        <Button variant='contained' sx={{mr: 1}} onClick={() => {
          props.onClose(false);
        }}>
          No
        </Button>
      </DialogActions>
    </Dialog>
  )
}
export default DeleteConfirmModal
