import React, {useState} from 'react'

import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'

import Typography from '@mui/material/Typography'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import Mod from "../../mod/loader/Mod";
import {CraftRecipe} from "../../mod/element/CraftRecipe";
import {ItemConfigUtil} from "../../mod/util/ItemConfigUtil";
import Item from "../../pages/config/item";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import {IconButton} from "@mui/material";
import ItemCard from "./ItemCard";
import SelectItemModal from "./SelectItemModal";


const CraftRecipeEditModal = (props: { isOpen: boolean,row:CraftRecipe, onClose: () => void, onSubmit: () => void }) => {
  const [isSetItem, setIsSetItem] = useState(false)

  const resultItemName = props.row.ResultItem.ItemName;
  const resultItemModId = props.row.ResultItem.ItemModId;
  const resultItem = ItemConfigUtil.GetItem(resultItemName,resultItemModId,Mod.instance?.itemConfig.items)
  const resultItemImageUrl = resultItem?.imageUrl ?? "";

  console.log(isSetItem)

  return (
    <Dialog
      fullWidth
      maxWidth='md'
      scroll='body'
      onClose={() => props.onClose()}
      onBackdropClick={() => props.onClose()}
      open={props.isOpen}
    >

      <DialogContent sx={{px: 15, py: 15, pt: 8}}>
        <Grid container spacing={6} alignItems={'center'}  justifyContent={'center'} xs={12}>
          <Grid item sm={12} sx={{textAlign: 'center'}}>
            <Typography variant='h4'>
              Create new item
            </Typography>
          </Grid>
        </Grid>


          <Grid item xs={12}>
            <Grid container spacing={6} justifyContent={'center'}>
              <ItemCard itemName={resultItemName} url={resultItemImageUrl} onClick={() => {setIsSetItem(true)}}></ItemCard>
              <ItemCard itemName={resultItemName} url={resultItemImageUrl} onClick={() => {setIsSetItem(true)}}></ItemCard>
              <ItemCard itemName={resultItemName} url={resultItemImageUrl} onClick={() => {setIsSetItem(true)}}></ItemCard>
            </Grid>
            <Grid container spacing={6} justifyContent={'center'}>
              <ItemCard itemName={resultItemName} url={resultItemImageUrl} onClick={() => {setIsSetItem(true)}}></ItemCard>
              <ItemCard itemName={resultItemName} url={resultItemImageUrl} onClick={() => {setIsSetItem(true)}}></ItemCard>
              <ItemCard itemName={resultItemName} url={resultItemImageUrl} onClick={() => {setIsSetItem(true)}}></ItemCard>
            </Grid>
            <Grid container spacing={6} justifyContent={'center'}>
              <ItemCard itemName={resultItemName} url={resultItemImageUrl} onClick={() => {setIsSetItem(true)}}></ItemCard>
              <ItemCard itemName={resultItemName} url={resultItemImageUrl} onClick={() => {setIsSetItem(true)}}></ItemCard>
              <ItemCard itemName={resultItemName} url={resultItemImageUrl} onClick={() => {setIsSetItem(true)}}></ItemCard>
            </Grid>
          </Grid>
        <SelectItemModal isOpen={isSetItem} onClose={() =>{setIsSetItem(false)}} onSelect={()=>{setIsSetItem(false)}}></SelectItemModal>
      </DialogContent>


      <DialogActions sx={{justifyContent: 'center', pb: 8}}>
        <Button variant='contained' sx={{mr: 1}} onClick={() => {
          props.onClose();
          props.onSubmit();
        }}>
          Submit
        </Button>
        <Button variant='outlined' color='secondary' onClick={() => props.onClose()}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CraftRecipeEditModal
