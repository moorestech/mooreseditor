import React, {useState} from 'react'
import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import {CraftRecipe, CraftRecipeItem, CraftResultItem} from "../../mod/element/CraftRecipe";
import {ItemConfigUtil} from "../../mod/util/ItemConfigUtil";
import ItemCard from "./ItemCard";
import SelectItemModal from "./SelectItemModal";
import {DefaultItemIconUrl, Item, NoneItemIconUrl} from "../../mod/element/Item";
import TextField from "@mui/material/TextField";
import {Delete} from "mdi-material-ui";
import {IconButton} from "@mui/material";


const CraftRecipeEditModal = (props: { isOpen: boolean,recipe:CraftRecipe,items :  ReadonlyArray<Item>, onClose: () => void, onSubmit: (recipe : CraftRecipe) => void }) => {
  const closeStateEditModalIndex = -1;

  const [recipeEditingItemIndex, setRecipeEditingItemIndex] = useState<number>(closeStateEditModalIndex)
  const [isResultItemEditing, setIsResultItemEditing] = useState<boolean>(false);
  const [recipe, setRecipe] = useState<CraftRecipe>(props.recipe);
  const backupRecipe = props.recipe.Copy();

  const items = props.items;

  const resultItemName = recipe.ResultItem.ItemName;
  const resultItemCount = recipe.ResultItem.Count;
  const resultItemImageUrl = ItemConfigUtil.GetItem(resultItemName,recipe.ResultItem.ItemModId,items)?.imageUrl ?? DefaultItemIconUrl;


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


  const changeRecipeItemCount = (index : number,count:number) => {
    const oldItem = recipe.Items[index];
    recipe.Items[index] = new CraftRecipeItem(oldItem.ItemName, oldItem.ItemModId, count);
    setRecipe(recipe.Copy());
  }

  const deleteItem = (index:number) => {
    recipe.Items[index] = new CraftRecipeItem(undefined, undefined, 0);
    setRecipe(recipe.Copy());
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
            <Typography variant='h4'>Edit recipe</Typography>
            <Typography variant='body1'>Required items</Typography>
          </Grid>
        </Grid>


          <Grid item xs={12} spacing={6} mt={15}>
            {//TODO 繰り返しを消したい
            }
            <Grid container mb={5} spacing={6} justifyContent={'center'}>
              <ItemCard itemName={itemRecipeData[0].itemName} url={itemRecipeData[0].itemUrl} onClick={() => {setRecipeEditingItemIndex(0)}}></ItemCard>
              <TextField value={itemRecipeData[0].count} onChange={v=>{changeRecipeItemCount(0,parseInt(v.target.value))}} label="Count" type={'number'} variant="outlined" sx={{width:60}}/>
              <IconButton onClick={()=>{deleteItem(0)}}><Delete/></IconButton>

              <ItemCard itemName={itemRecipeData[1].itemName} url={itemRecipeData[1].itemUrl} onClick={() => {setRecipeEditingItemIndex(1)}}></ItemCard>
              <TextField value={itemRecipeData[1].count} onChange={v=>{changeRecipeItemCount(1,parseInt(v.target.value))}} label="Count" type={'number'} variant="outlined" sx={{width:60}}/>
              <IconButton onClick={()=>{deleteItem(1)}}><Delete/></IconButton>

              <ItemCard itemName={itemRecipeData[2].itemName} url={itemRecipeData[2].itemUrl} onClick={() => {setRecipeEditingItemIndex(2)}}></ItemCard>
              <TextField value={itemRecipeData[2].count} onChange={v=>{changeRecipeItemCount(2,parseInt(v.target.value))}} label="Count" type={'number'} variant="outlined" sx={{width:60}}/>
              <IconButton onClick={()=>{deleteItem(2)}}><Delete/></IconButton>
            </Grid>


            <Grid container mb={5}  spacing={6} justifyContent={'center'}>
              <ItemCard itemName={itemRecipeData[3].itemName} url={itemRecipeData[3].itemUrl} onClick={() => {setRecipeEditingItemIndex(3)}}></ItemCard>
              <TextField value={itemRecipeData[3].count} onChange={v=>{changeRecipeItemCount(3,parseInt(v.target.value))}} label="Count" type={'number'} variant="outlined" sx={{width:60}}/>
              <IconButton onClick={()=>{deleteItem(3)}}><Delete/></IconButton>

              <ItemCard itemName={itemRecipeData[4].itemName} url={itemRecipeData[4].itemUrl} onClick={() => {setRecipeEditingItemIndex(4)}}></ItemCard>
              <TextField value={itemRecipeData[4].count} onChange={v=>{changeRecipeItemCount(4,parseInt(v.target.value))}} label="Count" type={'number'} variant="outlined" sx={{width:60}}/>
              <IconButton onClick={()=>{deleteItem(4)}}><Delete/></IconButton>

              <ItemCard itemName={itemRecipeData[5].itemName} url={itemRecipeData[5].itemUrl} onClick={() => {setRecipeEditingItemIndex(5)}}></ItemCard>
              <TextField value={itemRecipeData[5].count} onChange={v=>{changeRecipeItemCount(5,parseInt(v.target.value))}} label="Count" type={'number'} variant="outlined" sx={{width:60}}/>
              <IconButton onClick={()=>{deleteItem(5)}}><Delete/></IconButton>
            </Grid>


            <Grid container mb={5}  spacing={6} justifyContent={'center'}>
              <ItemCard itemName={itemRecipeData[6].itemName} url={itemRecipeData[6].itemUrl} onClick={() => {setRecipeEditingItemIndex(6)}}></ItemCard>
              <TextField value={itemRecipeData[6].count} onChange={v=>{changeRecipeItemCount(6,parseInt(v.target.value))}} label="Count" type={'number'} variant="outlined" sx={{width:60}}/>
              <IconButton onClick={()=>{deleteItem(6)}}><Delete/></IconButton>

              <ItemCard itemName={itemRecipeData[7].itemName} url={itemRecipeData[7].itemUrl} onClick={() => {setRecipeEditingItemIndex(7)}}></ItemCard>
              <TextField value={itemRecipeData[7].count} onChange={v=>{changeRecipeItemCount(7,parseInt(v.target.value))}} label="Count" type={'number'} variant="outlined" sx={{width:60}}/>
              <IconButton onClick={()=>{deleteItem(7)}}><Delete/></IconButton>

              <ItemCard itemName={itemRecipeData[8].itemName} url={itemRecipeData[8].itemUrl} onClick={() => {setRecipeEditingItemIndex(8)}}></ItemCard>
              <TextField value={itemRecipeData[8].count} onChange={v=>{changeRecipeItemCount(8,parseInt(v.target.value))}} label="Count" type={'number'} variant="outlined" sx={{width:60}}/>
              <IconButton onClick={()=>{deleteItem(8)}}><Delete/></IconButton>
            </Grid>
          </Grid>

        <Grid item sm={12} sx={{textAlign: 'center'}}>
          <Typography variant='body1'>Result item</Typography>
        </Grid>
        <Grid item xs={12} spacing={6} mt={15}>
          <Grid container mb={5} spacing={6} justifyContent={'center'}>
            <ItemCard itemName={resultItemName} url={resultItemImageUrl} onClick={() => {setIsResultItemEditing(true)}}></ItemCard>
            <TextField value={resultItemCount}
                       onChange={v=>{
                         const oldItem = recipe.ResultItem;
                         recipe.SetResultItem(new CraftResultItem(oldItem.ItemName, oldItem.ItemModId, parseInt(v.target.value)));
                         setRecipe(recipe.Copy());
                       }} label="Count" type={'number'} variant="outlined" sx={{width:60}}/>
          </Grid>

        </Grid>



        <SelectItemModal
          isOpen={recipeEditingItemIndex != closeStateEditModalIndex} onClose={() =>{setRecipeEditingItemIndex(closeStateEditModalIndex)}}
          onSelect={(item)=>{
            let count = recipe.Items[recipeEditingItemIndex].Count;
            if(count === 0) count = 1
            recipe.Items[recipeEditingItemIndex] = new CraftRecipeItem(item.name,item.modId,count);

            setRecipe(recipe)
            setRecipeEditingItemIndex(closeStateEditModalIndex)
        }}></SelectItemModal>

        <SelectItemModal
          isOpen={isResultItemEditing} onClose={() =>{setIsResultItemEditing(false)}}
          onSelect={(item)=>{
            let count = recipe.ResultItem.Count;
            if(count === 0) count = 1
            recipe.SetResultItem(new CraftResultItem(item.name,item.modId,count));

            setRecipe(recipe)
            setIsResultItemEditing(false)
          }}></SelectItemModal>

      </DialogContent>


      <DialogActions sx={{justifyContent: 'center', pb: 8}}>
        <Button disabled={recipe.ResultItem.Count <= 0} variant='contained' sx={{mr: 1}} onClick={() => {
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
