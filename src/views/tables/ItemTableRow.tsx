// ** React Imports
import React from 'react'

// ** MUI Imports
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'

// ** Icons Imports
import EditableTextField from "../form-layouts/EditableTextField";
import IconButton from "@mui/material/IconButton";
import {Item} from "../../mod/element/Item";


const ItemTableRow = (props: { row: Item,onEdit:(item: Item) => void}) => {
  return (
    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
      <TableCell>

        <IconButton aria-label='expand row' size='small'>
          <img src={props.row.imageUrl} alt='testItem' width={40} height={40} />
        </IconButton>
      </TableCell>


      <TableCell component='th' scope='row'>
        <EditableTextField fieldValue={props.row.id} type={"text"} placeholder={""} label={"Item Name"}
                           onEdit={text => {
                             const newItem = new Item(text,props.row.maxStacks,props.row.imageUrl);
                             props.onEdit(newItem);
                           }
        }/>
      </TableCell>
      <TableCell align='right'>
        <EditableTextField fieldValue={props.row.maxStacks.toString()} type={"number"} placeholder={""} label={"Max Stack"}
                           onEdit={text => {
                             const newItem = new Item(props.row.id,parseInt(text),props.row.imageUrl);
                             props.onEdit(newItem);
                           }}
        />
      </TableCell>
      <TableCell />

    </TableRow>
  )
}


export default ItemTableRow;
