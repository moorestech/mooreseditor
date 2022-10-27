import React, {useState} from 'react'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import IconButton from "@mui/material/IconButton";
import Pencil from "mdi-material-ui/Pencil";
import {CraftRecipe} from "../../mod/element/CraftRecipe";
import {Item} from "../../mod/element/Item";
import {ItemConfigUtil} from "../../mod/util/ItemConfigUtil";
import CraftRecipeEditModal from "../modal/CraftRecipeEditModal";


const CraftRecipeTableRow = (props: { recipe:CraftRecipe ,items : ReadonlyArray<Item>,onSubmit:(recipe:CraftRecipe)=>void }) => {
  const resultItemName = props.recipe.ResultItem.ItemName??"";
  const resultModId = props.recipe.ResultItem.ItemModId??"";

  const resultItem = ItemConfigUtil.GetItem(resultItemName,resultModId, props.items);

  const [isEditModalOn, setIsEditModalOn] = useState<boolean>(false);

  return (
    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>

      <TableCell>
        <img src={resultItem?.imageUrl} alt={resultItem?.name} width={40} height={40} />
      </TableCell>

      <TableCell align='left'></TableCell>


      <TableCell>
        <IconButton aria-label='expand row' size='small' onClick={() => {setIsEditModalOn(true)}}>
          <Pencil/>
        </IconButton>
        <CraftRecipeEditModal
          recipe={props.recipe.Copy()} isOpen={isEditModalOn} items={props.items} onClose={() => {setIsEditModalOn(false)}}
          onSubmit={recipe => {
            props.onSubmit(recipe);
            setIsEditModalOn(false)}}></CraftRecipeEditModal>
      </TableCell>



    </TableRow>
  )
}


export default CraftRecipeTableRow;
