import React, { Ref, useState, forwardRef, ReactElement } from 'react'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import Close from 'mdi-material-ui/Close'
import Mod from "../../mod/loader/Mod";


const CreateItemModal = (props: { isOpen:boolean, onClose: () => void ,onSubmit : (itemName : string,maxStack:number) => void}) => {

  const [nameIsDuplicateError, setNameIsDuplicateError] = useState<boolean>(false)
  const [isEmptyError, isEmptyErrorError] = useState<boolean>(true)
  const [maxStacksIsError, setMaxStacksIsError] = useState<boolean>(false)

  let itemName = '';
  let maxStacks = 100;

  return (
    <Dialog
      fullWidth
      open={props.isOpen}
      maxWidth='md'
      scroll='body'
      onClose={() => props.onClose()}
      onBackdropClick={() =>  props.onClose()}
    >
      <DialogContent sx={{ pb: 8, px: { xs: 8, sm: 15 }, pt: { xs: 8, sm: 12.5 }, position: 'relative' }}>
        <IconButton
          size='small'
          onClick={() =>  props.onClose()}
          sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
        >
          <Close />
        </IconButton>
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography variant='h4'>
            Edit Machine Parameters
          </Typography>
          <Typography variant='h6'>
            Can't change item name.
          </Typography>
        </Box>

        <Grid container spacing={6}>
          <Grid item sm={6} xs={12}>
            <TextField error={nameIsDuplicateError || isEmptyError} fullWidth label='Name' placeholder='Input Slot' type={'text'} autoFocus={true}
                       onChange={event => {
                         itemName = event.target.value;
                         isEmptyErrorError(itemName == '')
                         let isDuplicate = false;
                         for (const item of Mod.instance?.itemConfig.items) {
                           if (itemName == item.name){
                             isDuplicate = true;
                             break;
                           }
                         }
                         setNameIsDuplicateError(isDuplicate)
                       }}
                       helperText={nameIsDuplicateError ? 'Item Name is duplicate' : isEmptyError ? 'Can\'t item name empty' : ''}/>
          </Grid>
          <Grid item sm={6} xs={12}>
            <TextField error={maxStacksIsError} fullWidth defaultValue={maxStacks} label='Max Stacks' placeholder='Output Slot' type={'number'}
                       onChange={event => {
                         maxStacks = parseInt(event.target.value);
                         setMaxStacksIsError(maxStacks < 0)
                       }}
                       helperText={maxStacksIsError ? 'Output Slot must be greater than 0' : ''}/>
          </Grid>
        </Grid>

      </DialogContent>

      <DialogActions sx={{ pb: { xs: 8, sm: 12.5 }, justifyContent: 'center' }}>
        <Button variant='contained' sx={{ mr: 1 }} onClick={() =>  {
          props.onClose();
          props.onSubmit(itemName,maxStacks);
        }} disabled={nameIsDuplicateError}>
          Submit
        </Button>
        <Button variant='outlined' color='secondary' onClick={() =>  props.onClose()}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateItemModal
