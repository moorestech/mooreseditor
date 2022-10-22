import React from 'react'

import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogContent from '@mui/material/DialogContent'
import Mod from "../../mod/loader/Mod";
import Tooltip from "@mui/material/Tooltip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import {Item} from "../../mod/element/Item";
import {IconButton} from "@mui/material";


const SelectItemModal = (props: { isOpen:boolean, onClose: () => void ,onSelect : (item : Item) => void}) => {


  const renderItems = () => {
    return Mod.instance?.itemConfig.items.map(item => {
      //TODO sakastudio パディングが変なのでいい感じに修正する
      return (
        <Grid item key={item.name} sx={{p:0}}>
          <Tooltip arrow title={item.name} placement='top'  sx={{p:0}}>
            <Card sx={{p:0}}>
              <CardContent sx={{width:50,height:50,p:0}}>
                <IconButton aria-label='expand row' size='small'  onClick={() => props.onSelect(item)}>
                  <img src={item.imageUrl} alt={item.name} width={40} height={40} />
                </IconButton>
              </CardContent>
            </Card>
          </Tooltip>
        </Grid>
      )
    })
  }

  //TODO sakastudio 若干左にずれてるので修正する
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
