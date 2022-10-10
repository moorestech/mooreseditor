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
import {DefaultItemIconUrl, Item} from "../../mod/element/Item";
import Mod from "../../mod/loader/Mod";



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
            <TableCell>Id</TableCell>
            <TableCell align='right'>Max Stacks</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>

        <TableBody>
          {itemRows.map((item, index) => {
            return <ItemTableRow key={index} row={item} onEdit={(item) => {
              const newItems = [...itemRows];
              newItems[index] = item;
              setItemRows(newItems);
              Mod.instance?.itemConfig.changeItems(newItems);
            }}/>
          })}

          <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
            <TableCell>
              <IconButton aria-label='expand row' size='small' onClick={async () => {
                const addedRow = itemRows.concat(new Item("new item" + Math.floor(Math.random() * 1000),100,DefaultItemIconUrl));
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
