import React from 'react'

import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogContent from '@mui/material/DialogContent'
import Mod from '../../mod/loader/Mod'
import { Item } from '../../mod/element/Item'
import ItemCard from './ItemCard'

const SelectItemModal = (props: { isOpen: boolean; onClose: () => void; onSelect: (item: Item) => void }) => {
  const renderItems = () => {
    return Mod.instance?.itemConfig.items.map(item => {
      return <ItemCard key={item.name} itemName={item.name} url={item.imageUrl} onClick={() => props.onSelect(item)} />
    })
  }

  //TODO sakastudio 若干左にずれてるので修正する
  return (
    <Dialog
      fullWidth
      maxWidth='md'
      scroll='body'
      onClose={() => props.onClose()}
      onBackdropClick={() => props.onClose()}
      open={props.isOpen}
    >
      <DialogContent sx={{ px: 15, py: 15 }}>
        <Grid container spacing={6}>
          <Grid item sm={12} sx={{ textAlign: 'center' }}>
            <Typography variant='h4'>Select Item</Typography>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={6}>
            {renderItems()}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  )
}

export default SelectItemModal
