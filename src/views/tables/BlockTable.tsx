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
import BlockTableRow from "./BlockTableRow";

const createData = (name : string,maxStacks : number) => {
  return {
    name,
    maxStacks,
  }
}



const rows = [
  createData('Iron Ingot', 100),
  createData('Iron Ingot', 100),
  createData('Iron Ingot', 100),
  createData('Iron Ingot', 100),
]

function BlockTable() {
  const [copiedRow, setRows] = useState<{name: string, maxStacks: number}[]>(rows);

  return (
    <TableContainer component={Paper}>
      <Table aria-label='collapsible table'>

        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Item</TableCell>
            <TableCell />
            <TableCell />
          </TableRow>
        </TableHead>

        <TableBody>
          { copiedRow.map(row => {
            return <BlockTableRow key={row.name} row={row} />
          }) }

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


export default BlockTable;
