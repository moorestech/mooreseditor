// ** React Imports
import React from 'react'

// ** MUI Imports
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'

// ** Icons Imports
import EditableTextField from "../form-layouts/EditableTextField";
import Button from "@mui/material/Button";

interface ItemTableRowProps {
  name: string;
  maxStacks: number;
}

const ItemTableRow = (props: { row: ItemTableRowProps }) => {
  return (
    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
      <TableCell>

        <Button>
          <img src='/images/logos/iron ingot.png' alt='testItem' width={40} height={40} />
        </Button>
      </TableCell>


      <TableCell component='th' scope='row'>
        <EditableTextField fieldValue={props.row.name} type={"text"}/>
      </TableCell>
      <TableCell align='right'>
        <EditableTextField fieldValue={props.row.maxStacks.toString()} type={"number"}/>
      </TableCell>
      <TableCell />

    </TableRow>
  )
}


export default ItemTableRow;
