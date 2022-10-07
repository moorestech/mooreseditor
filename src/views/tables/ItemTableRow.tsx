// ** React Imports
import React from 'react'

// ** MUI Imports
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'

// ** Icons Imports
import EditableTextField from "../form-layouts/EditableTextField";
import IconButton from "@mui/material/IconButton";
import {Item} from "../../mod/Item";


const ItemTableRow = (props: { row: Item }) => {
  return (
    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
      <TableCell>

        <IconButton aria-label='expand row' size='small'>
          <img src='/images/logos/iron ingot.png' alt='testItem' width={40} height={40} />
        </IconButton>
      </TableCell>


      <TableCell component='th' scope='row'>
        <EditableTextField fieldValue={props.row.id} type={"text"} placeholder={""} label={"Item Name"}/>
      </TableCell>
      <TableCell align='right'>
        <EditableTextField fieldValue={props.row.maxStacks.toString()} type={"number"} placeholder={""} label={"Max Stack"}/>
      </TableCell>
      <TableCell />

    </TableRow>
  )
}


export default ItemTableRow;
