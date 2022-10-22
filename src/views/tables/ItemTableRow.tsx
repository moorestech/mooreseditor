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
          try {
            const newItem = await Mod.instance.itemConfig.updateItemImage(props.row)
            props.onEdit(newItem);
          }catch (e) {
            console.log(e)
          }
        }}>
          <img src={props.row.imageUrl} alt={props.row.name} width={40} height={40} />
        </IconButton>
      </TableCell>
      <TableCell component='th' scope='row'>{props.row.name}</TableCell>
      <TableCell align='right'>

        <TextField fullWidth label={"Max Stack"} type={"number"} size={"small"}
                   value={props.row.maxStacks}
                   onFocus={e => e.target.select()}
                   onChange={(e) => {
                     const text = e.target.value;
                     const newItem = new Item(props.row.modId,props.row.name,parseInt(text),props.row.imageUrl,props.row.imagePath);
                     props.onEdit(newItem);
                   }}
        />
      </TableCell>
      <TableCell />

    </TableRow>
  )
}


export default ItemTableRow;
