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
import Mod from "../../../mod/loader/Mod";


const BeltConveyorParamEditModal = (props: { isOpen:boolean,param : any, onClose: () => void ,onSubmit:(data:any) => void}) => {
  const [slotIsError, setSlotIsError] = useState<boolean>(false)
  const [timeIsError, setTimeIsError] = useState<boolean>(false)

  let slot = props.param.slot
  let time = props.param.time

  return (
    <Dialog
      fullWidth
      maxWidth='md'
      scroll='body'
      onClose={() => props.onClose()}
      onBackdropClick={() =>  props.onClose()}
      open={props.isOpen}
    >
      <DialogContent sx={{ px:15,py:15,pt:8  }}>
        <Grid container spacing={6}>
          <Grid item sm={12} sx={{ textAlign: 'center' }} >
            <Typography variant='h4'>
              Edit Machine Parameters
            </Typography>
          </Grid>


          <Grid container spacing={6}>
            <Grid item sm={6} xs={12}>
              <TextField error={slotIsError} fullWidth defaultValue={slot} label='Input Slot' placeholder='Input Slot' type={'number'}
                         onChange={event => {
                           slot = parseInt(event.target.value)
                           setSlotIsError(slot < 0)
                         }}
                         helperText={slotIsError ? 'Input Slot must be greater than 0' : ''}/>
            </Grid>
            <Grid item sm={6} xs={12}>
              <TextField error={timeIsError}  fullWidth defaultValue={time} label='Output Slot' placeholder='Output Slot' type={'number'}
                         onChange={event => {
                           time = parseInt(event.target.value)
                           setTimeIsError(time < 0)
                         }}
                         helperText={timeIsError ? 'Output Slot must be greater than 0' : ''}/>
            </Grid>
          </Grid>

        </Grid>
      </DialogContent>
      <DialogActions  sx={{justifyContent: 'center' }}>
        <Button
          variant='contained' sx={{ mr: 1 }}
          onClick={() =>  {
            const param = {
              slot: slot,
              time: time,
            }
            props.onSubmit(param)
          }}>
          Submit
        </Button>
        <Button variant='outlined' color='secondary' onClick={() =>  props.onClose()}>
          Discard
        </Button>
      </DialogActions>
    </Dialog>

  )
}

export default BeltConveyorParamEditModal
