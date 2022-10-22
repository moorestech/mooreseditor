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


const MachineParamEditModal = (props: { isOpen:boolean,param : any, onClose: () => void ,onSubmit:(data:any) => void}) => {
  const [inputIsError, setInputIsError] = useState<boolean>(false)
  const [outputIsError, setOutputIsError] = useState<boolean>(false)
  const [requiredPowerIsError, setRequiredPowerIsError] = useState<boolean>(false)

  let inputSlot = props.param.inputSlot
  let outputSlot = props.param.outputSlot
  let requiredPower = props.param.requiredPower

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
              <TextField error={inputIsError} fullWidth defaultValue={inputSlot} label='Input Slot' placeholder='Input Slot' type={'number'}
                         onChange={event => {
                           inputSlot = parseInt(event.target.value)
                           setInputIsError(inputSlot < 0)
                         }}
                         helperText={inputIsError ? 'Input Slot must be greater than 0' : ''}/>
            </Grid>
            <Grid item sm={6} xs={12}>
              <TextField error={outputIsError}  fullWidth defaultValue={outputSlot} label='Output Slot' placeholder='Output Slot' type={'number'}
                         onChange={event => {
                           outputSlot = parseInt(event.target.value)
                           setOutputIsError(outputSlot < 0)
                         }}
                         helperText={outputIsError ? 'Output Slot must be greater than 0' : ''}/>
            </Grid>
            <Grid item xs={12}>
              <TextField error={requiredPowerIsError}  fullWidth defaultValue={requiredPower} label='Required Power' placeholder='Required Power' type={'number'}
                         onChange={event => {
                           requiredPower = parseInt(event.target.value)
                           setRequiredPowerIsError(requiredPower < 0)
                         }}
                         helperText={requiredPowerIsError ? 'Required Power must be greater than 0' : ''}/>
            </Grid>
          </Grid>


        </Grid>
      </DialogContent>
      <DialogActions  sx={{justifyContent: 'center' }}>
        <Button
          variant='contained' sx={{ mr: 1 }}
          onClick={() =>  {
            const param = {
              inputSlot: inputSlot,
              outputSlot: outputSlot,
              requiredPower:requiredPower,
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

export default MachineParamEditModal
