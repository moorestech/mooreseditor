// ** React Imports
import React from 'react'

// ** MUI Imports
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'

// ** Icons Imports
import IconButton from "@mui/material/IconButton";
import Pencil from "mdi-material-ui/Pencil";
import {MachineRecipe} from "../../mod/element/MachineRecipe";
import {Item, NoneItemIconUrl} from "../../mod/element/Item";
import {ItemConfigUtil} from "../../mod/util/ItemConfigUtil";
import ItemCard from "../modal/ItemCard";
import Tooltip from "@mui/material/Tooltip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

const MachineRecipeTableRow = (props: { recipe: MachineRecipe, items: ReadonlyArray<Item> }) => {

  const dummy = () => {

  }

  return (
    <TableRow sx={{'& > *': {borderBottom: 'unset'}}}>

      <TableCell>
        {props.recipe.InputItems.map((recipe, index) => {
          const itemName = recipe.ItemName ?? "";
          const url = ItemConfigUtil.GetItem(itemName, recipe.ItemName ?? "", props.items)?.imageUrl ?? NoneItemIconUrl;

          return <Tooltip key={index} arrow title={itemName} placement='top'  sx={{p:0}}><img src={url} alt={itemName} width={40} height={40} /></Tooltip>
        })}
      </TableCell>

      <TableCell>
        {props.recipe.InputItems.map((recipe, index) => {
          const itemName = recipe.ItemName ?? "";
          const url = ItemConfigUtil.GetItem(itemName, recipe.ItemName ?? "", props.items)?.imageUrl ?? NoneItemIconUrl;

          return <Tooltip key={index} arrow title={itemName} placement='top'  sx={{p:0}}><img src={url} alt={itemName} width={40} height={40} /></Tooltip>
        })}
      </TableCell>


      <TableCell>
        {/*<IconButton aria-label='expand row' size='small'><Pencil/></IconButton>*/}
      </TableCell>


    </TableRow>
  )
}


export default MachineRecipeTableRow;
