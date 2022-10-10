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


const MachineParamEditModal = (props: { isOpen:boolean, onClose: () => void }) => {

  const [inputIsError, setInputIsError] = useState<boolean>(false)
  const [outputIsError, setOutputIsError] = useState<boolean>(false)
  const [requiredPowerIsError, setRequiredPowerIsError] = useState<boolean>(false)

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
        </Box>

        <Grid container spacing={6}>
          <Grid item sm={6} xs={12}>
            <TextField error={inputIsError} fullWidth defaultValue={3} label='Input Slot' placeholder='Input Slot' type={'number'}
                       onChange={event => {
                         setInputIsError(parseInt(event.target.value) < 0)
                       }}
                       helperText={inputIsError ? 'Input Slot must be greater than 0' : ''}/>
          </Grid>
          <Grid item sm={6} xs={12}>
            <TextField error={outputIsError}  fullWidth defaultValue={3} label='Output Slot' placeholder='Output Slot' type={'number'}
                       onChange={event => {
                         setOutputIsError(parseInt(event.target.value) < 0)
                       }}
                       helperText={outputIsError ? 'Output Slot must be greater than 0' : ''}/>
          </Grid>
          <Grid item xs={12}>
            <TextField error={requiredPowerIsError}  fullWidth defaultValue={100} label='Required Power' placeholder='Required Power' type={'number'}
                       onChange={event => {
                         setRequiredPowerIsError(parseInt(event.target.value) < 0)
                       }}
                       helperText={requiredPowerIsError ? 'Required Power must be greater than 0' : ''}/>
          </Grid>
        </Grid>

      </DialogContent>

      <DialogActions sx={{ pb: { xs: 8, sm: 12.5 }, justifyContent: 'center' }}>
        <Button variant='contained' sx={{ mr: 1 }} onClick={() =>  props.onClose()}>
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
