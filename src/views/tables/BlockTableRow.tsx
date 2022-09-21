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
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";

interface ItemTableRowProps {
  name: string;
  maxStacks: number;
}

const BlockTableRow = (props: { row: ItemTableRowProps }) => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    console.log("aaa");
    setOpen(false);
  };

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
        <IconButton aria-label='expand row' size='small' onClick={handleClickOpen}>
          <Pencil/>

          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Subscribe</DialogTitle>
            <DialogContent>
              <DialogContentText>
                To subscribe to this website, please enter your email address here. We
                will send updates occasionally.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Email Address"
                type="email"
                fullWidth
                variant="standard"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={handleClose}>Subscribe</Button>
            </DialogActions>
          </Dialog>
        </IconButton>
      </TableCell>

      <TableCell />

    </TableRow>
  )
}


export default BlockTableRow;
