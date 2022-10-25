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
import TextField from "@mui/material/TextField";


const CraftRecipeEditModal = (props: { isOpen: boolean,row:CraftRecipe,items :  ReadonlyArray<Item>, onClose: () => void, onSubmit: (recipe : CraftRecipe) => void }) => {
  const [editingItemIndex, setEditingItemIndex] = useState<number>(-1)
  const [recipe, setRecipe] = useState<CraftRecipe>(props.row);
  const backupRecipe = props.row.Copy();

  const items = props.items;

  const resultItemName = recipe.ResultItem.ItemName;
  const resultItemImageUrl = ItemConfigUtil.GetItem(resultItemName,recipe.ResultItem.ItemModId,items)?.imageUrl ?? "";


  const itemRecipeData:{itemName:string,itemUrl:string,count:number}[] = [];
  for (let i = 0; i < recipe.Items.length; i++) {
    const item = recipe.Items[i];
    if (item.ItemName === undefined || item.ItemModId === undefined){
      itemRecipeData.push({itemName:"none",itemUrl:NoneItemIconUrl,count:0});
    }else{
      const itemData = ItemConfigUtil.GetItem(item.ItemName,item.ItemModId,items);
      itemRecipeData.push({itemName:itemData?.name ?? "",itemUrl:itemData?.imageUrl ?? "",count:item.Count});
    }
  }


  const changeItemCount = (index : number,count:number) => {
    const oldItem = recipe.Items[index];
    recipe.Items[index] = new CraftRecipeItem(oldItem.ItemName, oldItem.ItemModId, count);
    setRecipe(recipe);
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
              Edit recipe
            </Typography>
          </Grid>
        </Grid>


          <Grid item xs={12} spacing={6} mt={15}>
            {//TODO 繰り返しを消したい
            }
            <Grid container mb={5} spacing={6} justifyContent={'center'}>
              <ItemCard itemName={itemRecipeData[0].itemName} url={itemRecipeData[0].itemUrl} onClick={() => {setEditingItemIndex(0)}}></ItemCard>
              <TextField defaultValue={itemRecipeData[0].count} onChange={v=>{changeItemCount(0,parseInt(v.target.value))}} label="Count" type={'number'} variant="outlined" sx={{width:60}}/>

              <ItemCard itemName={itemRecipeData[1].itemName} url={itemRecipeData[1].itemUrl} onClick={() => {setEditingItemIndex(1)}}></ItemCard>
              <TextField defaultValue={itemRecipeData[1].count} onChange={v=>{changeItemCount(1,parseInt(v.target.value))}} label="Count" type={'number'} variant="outlined" sx={{width:60}}/>

              <ItemCard itemName={itemRecipeData[2].itemName} url={itemRecipeData[2].itemUrl} onClick={() => {setEditingItemIndex(2)}}></ItemCard>
              <TextField defaultValue={itemRecipeData[2].count} onChange={v=>{changeItemCount(2,parseInt(v.target.value))}} label="Count" type={'number'} variant="outlined" sx={{width:60}}/>
            </Grid>


            <Grid container mb={5}  spacing={6} justifyContent={'center'}>
              <ItemCard itemName={itemRecipeData[3].itemName} url={itemRecipeData[3].itemUrl} onClick={() => {setEditingItemIndex(3)}}></ItemCard>
              <TextField defaultValue={itemRecipeData[3].count} onChange={v=>{changeItemCount(3,parseInt(v.target.value))}} label="Count" type={'number'} variant="outlined" sx={{width:60}}/>

              <ItemCard itemName={itemRecipeData[4].itemName} url={itemRecipeData[4].itemUrl} onClick={() => {setEditingItemIndex(4)}}></ItemCard>
              <TextField defaultValue={itemRecipeData[4].count} onChange={v=>{changeItemCount(4,parseInt(v.target.value))}} label="Count" type={'number'} variant="outlined" sx={{width:60}}/>

              <ItemCard itemName={itemRecipeData[5].itemName} url={itemRecipeData[5].itemUrl} onClick={() => {setEditingItemIndex(5)}}></ItemCard>
              <TextField defaultValue={itemRecipeData[5].count} onChange={v=>{changeItemCount(5,parseInt(v.target.value))}} label="Count" type={'number'} variant="outlined" sx={{width:60}}/>
            </Grid>


            <Grid container mb={5}  spacing={6} justifyContent={'center'}>
              <ItemCard itemName={itemRecipeData[6].itemName} url={itemRecipeData[6].itemUrl} onClick={() => {setEditingItemIndex(6)}}></ItemCard>
              <TextField defaultValue={itemRecipeData[6].count} onChange={v=>{changeItemCount(6,parseInt(v.target.value))}} label="Count" type={'number'} variant="outlined" sx={{width:60}}/>

              <ItemCard itemName={itemRecipeData[7].itemName} url={itemRecipeData[7].itemUrl} onClick={() => {setEditingItemIndex(7)}}></ItemCard>
              <TextField defaultValue={itemRecipeData[7].count} onChange={v=>{changeItemCount(7,parseInt(v.target.value))}} label="Count" type={'number'} variant="outlined" sx={{width:60}}/>

              <ItemCard itemName={itemRecipeData[8].itemName} url={itemRecipeData[8].itemUrl} onClick={() => {setEditingItemIndex(8)}}></ItemCard>
              <TextField defaultValue={itemRecipeData[8].count} onChange={v=>{changeItemCount(8,parseInt(v.target.value))}} label="Count" type={'number'} variant="outlined" sx={{width:60}}/>
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
