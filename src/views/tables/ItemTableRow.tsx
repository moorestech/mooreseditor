import React from 'react'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import IconButton from "@mui/material/IconButton";
import {Item} from "../../mod/element/Item";
import TextField from "@mui/material/TextField";
import Mod from "../../mod/loader/Mod";


const ItemTableRow = (props: { row: Item,onEdit:(item: Item) => void}) => {
  return (
    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
      <TableCell>

        <IconButton aria-label='expand row' size='small'
        onClick={async () =>{
          const newItem = await Mod.instance.itemConfig.updateItemImage(props.row)
          props.onEdit(newItem);
        }}>
          <img src={props.row.imageUrl} alt='testItem' width={40} height={40} />
        </IconButton>
      </TableCell>


      <TableCell component='th' scope='row'>


        <TextField fullWidth label={"Item Name"} type={"text"} size={"small"}
                   value={props.row.name}
                   onFocus={e => e.target.select()}
                   onChange={(e) => {
                     const name = e.target.value;
                     const newItem = new Item(name,props.row.maxStacks,props.row.imageUrl,props.row.imagePath);
                     props.onEdit(newItem);
                   }}
        />

      </TableCell>
      <TableCell align='right'>

        <TextField fullWidth label={"Max Stack"} type={"number"} size={"small"}
                   value={props.row.maxStacks}
                   onFocus={e => e.target.select()}
                   onChange={(e) => {
                     const text = e.target.value;
                     const newItem = new Item(props.row.name,parseInt(text),props.row.imageUrl,props.row.imagePath);
                     props.onEdit(newItem);
                   }}
        />
      </TableCell>
      <TableCell />

    </TableRow>
  )
}


export default ItemTableRow;
