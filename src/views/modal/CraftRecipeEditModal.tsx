import React, {useState} from 'react'
import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import {CraftRecipe, CraftRecipeItem} from "../../mod/element/CraftRecipe";
import {ItemConfigUtil} from "../../mod/util/ItemConfigUtil";
import ItemCard from "./ItemCard";
import SelectItemModal from "./SelectItemModal";
import {Item, NoneItemIconUrl} from "../../mod/element/Item";


const CraftRecipeEditModal = (props: { isOpen: boolean,row:CraftRecipe,items :  ReadonlyArray<Item>, onClose: () => void, onSubmit: (recipe : CraftRecipe) => void }) => {
  const [editingItemIndex, setEditingItemIndex] = useState<number>(-1)
  const [recipe, setRecipe] = useState<CraftRecipe>(props.row);
  const backupRecipe = props.row.Copy();

  const items = props.items;

  const resultItemName = recipe.ResultItem.ItemName;
  const resultItemImageUrl = ItemConfigUtil.GetItem(resultItemName,recipe.ResultItem.ItemModId,items)?.imageUrl ?? "";


  const itemRecipeData:{itemName:string,itemUrl:string}[] = [];
  for (let i = 0; i < recipe.Items.length; i++) {
    const item = recipe.Items[i];
    if (item.ItemName === undefined || item.ItemModId === undefined){
      itemRecipeData.push({itemName:"none",itemUrl:NoneItemIconUrl});
    }else{
      const itemData = ItemConfigUtil.GetItem(item.ItemName,item.ItemModId,items);
      itemRecipeData.push({itemName:itemData?.name ?? "",itemUrl:itemData?.imageUrl ?? ""});
    }
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


          <Grid item xs={12} spacing={6}>
            {//TODO 繰り返しを消したい
            }
            <Grid container spacing={6} justifyContent={'center'}>
              <ItemCard itemName={itemRecipeData[0].itemName} url={itemRecipeData[0].itemUrl} onClick={() => {setEditingItemIndex(0)}}></ItemCard>
              <ItemCard itemName={itemRecipeData[1].itemName} url={itemRecipeData[1].itemUrl} onClick={() => {setEditingItemIndex(1)}}></ItemCard>
              <ItemCard itemName={itemRecipeData[2].itemName} url={itemRecipeData[2].itemUrl} onClick={() => {setEditingItemIndex(2)}}></ItemCard>
            </Grid>
            <Grid container spacing={6} justifyContent={'center'}>
              <ItemCard itemName={itemRecipeData[3].itemName} url={itemRecipeData[3].itemUrl} onClick={() => {setEditingItemIndex(3)}}></ItemCard>
              <ItemCard itemName={itemRecipeData[4].itemName} url={itemRecipeData[4].itemUrl} onClick={() => {setEditingItemIndex(4)}}></ItemCard>
              <ItemCard itemName={itemRecipeData[5].itemName} url={itemRecipeData[5].itemUrl} onClick={() => {setEditingItemIndex(5)}}></ItemCard>
            </Grid>
            <Grid container spacing={6} justifyContent={'center'}>
              <ItemCard itemName={itemRecipeData[6].itemName} url={itemRecipeData[6].itemUrl} onClick={() => {setEditingItemIndex(6)}}></ItemCard>
              <ItemCard itemName={itemRecipeData[7].itemName} url={itemRecipeData[7].itemUrl} onClick={() => {setEditingItemIndex(7)}}></ItemCard>
              <ItemCard itemName={itemRecipeData[8].itemName} url={itemRecipeData[8].itemUrl} onClick={() => {setEditingItemIndex(8)}}></ItemCard>
            </Grid>
          </Grid>

        <SelectItemModal
          isOpen={editingItemIndex != -1} onClose={() =>{setEditingItemIndex(-1)}}
          onSelect={(item)=>{
            const count = recipe.Items[editingItemIndex].Count;
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
        <Button variant='outlined' color='secondary' onClick={() => {
          props.onClose()
          setRecipe(backupRecipe);
        }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CraftRecipeEditModal
