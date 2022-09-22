// ** React Imports
import React from 'react'

// ** MUI Imports
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'

// ** Icons Imports
import IconButton from "@mui/material/IconButton";
import Pencil from "mdi-material-ui/Pencil";

interface ItemTableRowProps {
  name: string;
  maxStacks: number;
}

const MachineRecipeTableRow = (props: { row: ItemTableRowProps }) => {
  return (
    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>

  <TableCell>
    <img src='/images/logos/iron ingot.png' alt='testItem' width={40} height={40} />
  </TableCell>

  <TableCell align='left'>ああ</TableCell>


  <TableCell>
  <IconButton aria-label='expand row' size='small'>
    <Pencil/>

    </IconButton>
    </TableCell>



    </TableRow>
)
}


export default MachineRecipeTableRow;
