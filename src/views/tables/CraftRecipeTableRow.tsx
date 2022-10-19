// ** React Imports
import React from 'react'

// ** MUI Imports
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'

// ** Icons Imports
import IconButton from "@mui/material/IconButton";
import Pencil from "mdi-material-ui/Pencil";
import {CraftRecipe} from "../../mod/element/CraftRecipe";
import {Item} from "../../mod/element/Item";
import {ItemConfigUtil} from "../../mod/util/ItemConfigUtil";


const CraftRecipeTableRow = (props: { recipe:CraftRecipe ,items : ReadonlyArray<Item>}) => {
  const resultItemName = props.recipe.ResultItem.ItemName;
  const resultModId = props.recipe.ResultItem.ItemModId;

  const resultItem = ItemConfigUtil.GetItem(resultItemName,resultModId, props.items);



  return (
    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>

      <TableCell>
        <img src={resultItem?.imageUrl} alt={resultItem?.name} width={40} height={40} />
      </TableCell>

      <TableCell align='left'></TableCell>


      <TableCell>
        <IconButton aria-label='expand row' size='small'>
          <Pencil/>

        </IconButton>
      </TableCell>



    </TableRow>
  )
}


export default CraftRecipeTableRow;
