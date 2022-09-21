// ** React Imports
import React from 'react'

// ** MUI Imports
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'

// ** Icons Imports
import EditableTextField from "../form-layouts/EditableTextField";
import IconButton from "@mui/material/IconButton";
import CraftRecipeTable from "./CraftRecipeTable";
import Pencil from "mdi-material-ui/Pencil";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

interface ItemTableRowProps {
  name: string;
  maxStacks: number;
}

const CraftRecipeTableRow = (props: { row: ItemTableRowProps }) => {
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


export default CraftRecipeTableRow;
