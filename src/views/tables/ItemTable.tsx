// ** React Imports
import { useState, Fragment } from 'react'

// ** MUI Imports
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'

// ** Icons Imports
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import {ChevronUp} from "mdi-material-ui";
import ChevronDown from "mdi-material-ui/ChevronDown";

const createData = (name: string, maxStacks: number) => {
  return {
    name,
    maxStacks,
  }
}

const Row = (props: { row: ReturnType<typeof createData> }) => {
  // ** Props
  const { row } = props

  // ** State
  const [editName,setEditName] = useState<boolean>(false);

  return (
    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
      <TableCell>
        <img src='/images/logos/mastercard-label.png' alt='testItem' width={40} height={40} />
      </TableCell>

      <TableCell component='th' scope='row'  onClick={() => setEditName(!editName)}>
        {editName ?
          <TextField fullWidth label='Name' placeholder='Item Name' size={"small"} defaultValue={row.name} autoFocus={true} /> :
          <p>{row.name}</p>
        }
      </TableCell>
      <TableCell align='right'>{row.maxStacks}</TableCell>
      <TableCell />
    </TableRow>
  )
}

const rows = [
  createData('Frozen yoghurt', 159),
  createData('Ice cream sandwich', 237),
  createData('Eclair', 262),
  createData('Cupcake', 305),
  createData('Gingerbread', 356)
]

const ItemTable = () => {
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
          {rows.map(row => (
            <Row key={row.name} row={row} />
          ))}

          <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
            <TableCell>
              <IconButton aria-label='expand row' size='small' onClick={() => {
                rows.push(createData('Frozen yoghurt', 159),)
              }}>
                <ChevronUp />
              </IconButton>
            </TableCell>
          </TableRow>

        </TableBody>

      </Table>
    </TableContainer>
  )
}

export default ItemTable
