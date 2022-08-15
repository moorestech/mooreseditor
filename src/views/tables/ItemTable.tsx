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

const createData = (name : string,maxStacks : number) => {
  return {
    name,
    maxStacks,
  }
}



const rows = [
  createData('Frozen yoghurt', 159),
]

function ItemTable() {
  const [copiedRow, setRows] = useState<{name: string, maxStacks: number}[]>(rows);

  const rowsTag = copiedRow.map(row => {
    return <ItemTableRow key={row.name} row={row} />
  })

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
          { rowsTag }

          <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
            <TableCell>
              <IconButton aria-label='expand row' size='small' onClick={() => {
                const addedRow = copiedRow.concat(createData('Frozen yoghurt ' + copiedRow.length, 159));
                setRows(addedRow);
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
