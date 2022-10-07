// ** React Imports
import React, {useState} from 'react'

// ** MUI Imports
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'

// ** Icons Imports
import IconButton from "@mui/material/IconButton";
import Plus from 'mdi-material-ui/Plus';
import ItemTableRow from "./ItemTableRow";
import {Item} from "../../mod/Item";
import Mod from "../../mod/Mod";



function ItemTable() {
  const [itemRows, setItemRows] = useState<Item[]>(Mod.instance ? Mod.instance.itemConfig.items : []);

  Mod.onModUpdate.subscribe((mod) => {
    setItemRows(mod.itemConfig.items);
  });

  return (
    <TableContainer component={Paper}>
      <Table aria-label='collapsible table'>

        <TableHead>
          <TableRow>
            <TableCell>Icon</TableCell>
            <TableCell>Name</TableCell>
            <TableCell align='right'>Max Stacks</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>

        <TableBody>
          { itemRows.map(row => {
            return <ItemTableRow key={row.id} row={row} />;
          }) }

          <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
            <TableCell>
              <IconButton aria-label='expand row' size='small' onClick={async () => {
                const addedRow = itemRows.concat(new Item("new item" + Math.floor(Math.random() * 1000),100));
                await Mod.instance.itemConfig.changeItems(addedRow);
                setItemRows(addedRow);
              }}>
                <Plus />
              </IconButton>
            </TableCell>
          </TableRow>

        </TableBody>

      </Table>
    </TableContainer>
  )
}


export default ItemTable
