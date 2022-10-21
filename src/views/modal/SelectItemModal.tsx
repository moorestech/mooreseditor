import React, { Ref, useState, forwardRef, ReactElement } from 'react'

import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Mod from "../../mod/loader/Mod";
import Tooltip from "@mui/material/Tooltip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import {Item} from "../../mod/element/Item";


const SelectItemModal = (props: { isOpen:boolean, onClose: () => void ,onSelect : (item : Item) => void}) => {


  const renderItems = () => {
    return Mod.instance?.itemConfig.items.map(item => {

      return (
        <Grid item key={item.name}>
          <Tooltip arrow title={item.name} placement='top'>
            <Card>
              <CardContent sx={{ display: 'flex' }}>
                <img src={item.imageUrl} alt={item.name} width={40} height={40} />
              </CardContent>
            </Card>
          </Tooltip>
        </Grid>
      )
    })
  }

  return (
    <Dialog
      fullWidth
      maxWidth='md'
      scroll='body'
      onClose={() => props.onClose()}
      onBackdropClick={() =>  props.onClose()}
      open={props.isOpen}
    >
      <DialogContent sx={{ px:15,py:15 }}>
        <Grid container spacing={6}>
          <Grid item sm={12} sx={{ textAlign: 'center' }} >
            <Typography variant='h4'>
              Select Item
            </Typography>
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
