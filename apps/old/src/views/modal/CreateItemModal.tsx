import React, { useState } from 'react'
import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Mod from '../../mod/loader/Mod'

const CreateItemModal = (props: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (itemName: string, maxStack: number) => void
}) => {
  const [nameIsDuplicateError, setNameIsDuplicateError] = useState<boolean>(false)
  const [isEmptyError, isEmptyErrorError] = useState<boolean>(true)
  const [maxStacksIsError, setMaxStacksIsError] = useState<boolean>(false)

  let itemName = ''
  let maxStacks = 100

  return (
    <Dialog
      fullWidth
      maxWidth='md'
      scroll='body'
      onClose={() => props.onClose()}
      onBackdropClick={() => props.onClose()}
      open={props.isOpen}
    >
      <DialogContent sx={{ px: 15, py: 15, pt: 8 }}>
        <Grid container spacing={6}>
          <Grid item sm={12} sx={{ textAlign: 'center' }}>
            <Typography variant='h4'>Create new item</Typography>
            <Typography variant='h6'>Can't change item name</Typography>
          </Grid>
          <Grid item sm={6} xs={12}>
            <TextField
              error={nameIsDuplicateError || isEmptyError}
              fullWidth
              label='Name'
              placeholder='Item Name'
              type={'text'}
              autoFocus={true}
              onChange={event => {
                itemName = event.target.value
                isEmptyErrorError(itemName == '')
                let isDuplicate = false
                for (const item of Mod.instance?.itemConfig.items) {
                  if (itemName == item.name) {
                    isDuplicate = true
                    break
                  }
                }
                setNameIsDuplicateError(isDuplicate)
              }}
              helperText={nameIsDuplicateError ? 'Item Name is duplicate' : isEmptyError ? "Can't item name empty" : ''}
            />
          </Grid>
          <Grid item sm={6} xs={12}>
            <TextField
              error={maxStacksIsError}
              fullWidth
              defaultValue={maxStacks}
              label='Max Stacks'
              placeholder='Output Slot'
              type={'number'}
              onChange={event => {
                maxStacks = parseInt(event.target.value)
                setMaxStacksIsError(maxStacks < 0)
              }}
              helperText={maxStacksIsError ? 'Output Slot must be greater than 0' : ''}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 8 }}>
        <Button
          variant='contained'
          sx={{ mr: 1 }}
          onClick={() => {
            props.onClose()
            props.onSubmit(itemName, maxStacks)
          }}
          disabled={nameIsDuplicateError}
        >
          Submit
        </Button>
        <Button variant='outlined' color='secondary' onClick={() => props.onClose()}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateItemModal
