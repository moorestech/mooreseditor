// ** React Imports
import React from 'react'

// ** MUI Imports
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'

// ** Icons Imports
import IconButton from "@mui/material/IconButton";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import {Select, TextField} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";

interface ItemTableRowProps {
  name: string;
  maxStacks: number;
}

const OreTableRow = (props: { row: ItemTableRowProps }) => {
  return (
    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
      <TableCell>

        <IconButton aria-label='expand row' size='small'>
          <img src='/images/logos/iron ingot.png' alt='testItem' width={40} height={40} />
        </IconButton>
      </TableCell>


      <TableCell component='th' scope='row'>

        <TextField value={props.row.name} type={"text"} placeholder={""} label={"Item Name"}/>
      </TableCell>

      <TableCell>
        <FormControl>
          <InputLabel id="demo-simple-select-label">Item</InputLabel>
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


      <TableCell component='th' scope='row'>
        <TextField value={props.row.maxStacks.toString()} type={"number"} placeholder={""} label={"Vein Size"}/>
      </TableCell>

      <TableCell component='th' scope='row'>
        <TextField value={props.row.maxStacks.toString()} type={"number"} placeholder={""} label={"Vein Frequency"}/>
      </TableCell>

      <TableCell component='th' scope='row'>
        <TextField value={props.row.maxStacks.toString()} type={"number"} placeholder={""} label={"Priority"}/>
      </TableCell>

      <TableCell />

    </TableRow>
  )
}


export default OreTableRow;
