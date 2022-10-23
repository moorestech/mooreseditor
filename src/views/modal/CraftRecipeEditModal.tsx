import React, {useState} from 'react'
import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Mod from "../../mod/loader/Mod";
import {CraftRecipe, CraftRecipeItem} from "../../mod/element/CraftRecipe";
import {ItemConfigUtil} from "../../mod/util/ItemConfigUtil";
import ItemCard from "./ItemCard";
import SelectItemModal from "./SelectItemModal";


const CraftRecipeEditModal = (props: { isOpen: boolean,row:CraftRecipe, onClose: () => void, onSubmit: (recipe : CraftRecipe) => void }) => {
  const [editingItemIndex, setEditingItemIndex] = useState<number>(-1)
  const [recipe, setRecipe] = useState<CraftRecipe>({...props.row});

  const resultItemName = props.row.ResultItem.ItemName;
  const resultItem = ItemConfigUtil.GetItem(resultItemName,props.row.ResultItem.ItemModId,Mod.instance?.itemConfig.items)
  const resultItemImageUrl = resultItem?.imageUrl ?? "";

  const craftTableEditor: JSX.Element[] = [];
  for (let i = 0; i < 9; i++) {
    craftTableEditor.push(
      <Grid container spacing={6} justifyContent={'center'}>
        <ItemCard itemName={resultItemName} url={resultItemImageUrl} onClick={() => {setEditingItemIndex(0)}}></ItemCard>
        <ItemCard itemName={resultItemName} url={resultItemImageUrl} onClick={() => {setEditingItemIndex(1)}}></ItemCard>
        <ItemCard itemName={resultItemName} url={resultItemImageUrl} onClick={() => {setEditingItemIndex(2)}}></ItemCard>
      </Grid>
    )
  }

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
            <Grid container spacing={6} justifycontent={'center'}>
              <itemcard itemname={resultitemname} url={resultitemimageurl} onclick={() => {seteditingitemindex(0)}}></itemcard>
              <itemcard itemname={resultitemname} url={resultitemimageurl} onclick={() => {seteditingitemindex(1)}}></itemcard>
              <itemcard itemname={resultitemname} url={resultitemimageurl} onclick={() => {seteditingitemindex(2)}}></itemcard>
            </Grid>
            <Grid container spacing={6} justifyContent={'center'}>
              <ItemCard itemName={resultItemName} url={resultItemImageUrl} onClick={() => {setEditingItemIndex(3)}}></ItemCard>
              <ItemCard itemName={resultItemName} url={resultItemImageUrl} onClick={() => {setEditingItemIndex(4)}}></ItemCard>
              <ItemCard itemName={resultItemName} url={resultItemImageUrl} onClick={() => {setEditingItemIndex(5)}}></ItemCard>
            </Grid>
            <Grid container spacing={6} justifyContent={'center'}>
              <ItemCard itemName={resultItemName} url={resultItemImageUrl} onClick={() => {setEditingItemIndex(6)}}></ItemCard>
              <ItemCard itemName={resultItemName} url={resultItemImageUrl} onClick={() => {setEditingItemIndex(7)}}></ItemCard>
              <ItemCard itemName={resultItemName} url={resultItemImageUrl} onClick={() => {setEditingItemIndex(8)}}></ItemCard>
            </Grid>
          </Grid>

        <SelectItemModal
          isOpen={editingItemIndex != -1} onClose={() =>{setEditingItemIndex(-1)}}
          onSelect={(item)=>{
            const count = recipe.Items[editingItemIndex].Count;
            console.log(item.name)
            recipe.Items[editingItemIndex] = new CraftRecipeItem(item.name,item.modId,count);
            setRecipe(recipe)

            setEditingItemIndex(-1)
        }}></SelectItemModal>

      </DialogContent>


      <DialogActions sx={{justifyContent: 'center', pb: 8}}>
        <Button variant='contained' sx={{mr: 1}} onClick={() => {
          props.onClose();
          props.onSubmit(recipe);
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
