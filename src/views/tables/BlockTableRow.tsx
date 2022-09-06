// ** React Imports
import React from 'react'

// ** MUI Imports
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'

// ** Icons Imports
import EditableTextField from "../form-layouts/EditableTextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import {Select} from "@mui/material";
import Button from "@mui/material/Button";
import Pencil from 'mdi-material-ui/pencil';
import IconButton from "@mui/material/IconButton";

interface ItemTableRowProps {
  name: string;
  maxStacks: number;
}

const BlockTableRow = (props: { row: ItemTableRowProps }) => {
  return (
    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>

      <TableCell component='th' scope='row'>
        <EditableTextField fieldValue={props.row.name} type={"text"}/>
      </TableCell>

      <TableCell>
        <FormControl>
          <InputLabel id="select-block-type">Type</InputLabel>
          <Select
            labelId="select-block-type"
            id="demo-simple-select"
            value="Block"
            label="Age"
          >
            <MenuItem value="Block">Block</MenuItem>
            <MenuItem value="Machine">Machine</MenuItem>
            <MenuItem value="Miner">Miner</MenuItem>
          </Select>
        </FormControl>
      </TableCell>

      <TableCell>
        <FormControl>
          <InputLabel id="demo-simple-select-label">Age</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value="Iron Ingot"
            label="Item"
          >
            <MenuItem value="Iron Ingot">Iron Ingot</MenuItem>
            <MenuItem value="Copper Ingot">Copper Ingot</MenuItem>
            <MenuItem value="Gold Ingot">Gold Ingot</MenuItem>
          </Select>
        </FormControl>
      </TableCell>

      <TableCell>
        <IconButton aria-label='expand row' size='small'>
          <Pencil/>
        </IconButton>
      </TableCell>

      <TableCell />

    </TableRow>
  )
}


export default BlockTableRow;
