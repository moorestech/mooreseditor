// ** React Imports
import React from 'react'

// ** MUI Imports
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import {Select} from "@mui/material";
import Pencil from 'mdi-material-ui/pencil';
import IconButton from "@mui/material/IconButton";
import MachineParamEditModal from "../modal/MachineParamEditModal";
import {Block} from "../../mod/element/Block";
import TextField from "@mui/material/TextField";
import Mod from "../../mod/loader/Mod";
import SelectBlockType from "../../mod/component/SelectBlockType";


const BlockTableRow = (props: { row: Block ,onEdit:(block: Block) => void}) => {
  const [isOpen, setIsOpen] = React.useState(false);


  return (
    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>

      <TableCell component='th' scope='row'>

        <TextField fullWidth label={"Block Name"} type={"text"} size={"small"}
                   value={props.row.name}
                   onFocus={e => e.target.select()}
                   onChange={(e) => {
                     const name = e.target.value;
                     const newBlock = new Block(name,props.row.type,props.row.itemModId,props.row.itemName,props.row.modelTransform,props.row.param);
                     props.onEdit(newBlock);
                   }}
        />
      </TableCell>

      <TableCell>
        <FormControl>
          <InputLabel >Type</InputLabel>
          <SelectBlockType value={props.row.type} label={'Type'} onChange={type => {
            const newBlock = new Block(props.row.name,type,props.row.itemModId,props.row.itemName,props.row.modelTransform,props.row.param);
            props.onEdit(newBlock);
          }} />
        </FormControl>
      </TableCell>

      <TableCell>
        <FormControl>
          <InputLabel>Item</InputLabel>
          <Select
            id="demo-simple-select"
            defaultValue={props.row.itemName}
            label="Item"
          >
            {
              Mod.instance?.itemConfig.items.map(item => {
                return <MenuItem key={item.name} value={item.name}>{item.name}</MenuItem>
              })
            }
          </Select>
        </FormControl>
      </TableCell>

      <TableCell>
        <IconButton aria-label='expand row' size='small' onClick={() => setIsOpen(true)}>
          <Pencil/>
        </IconButton>

        <MachineParamEditModal isOpen={isOpen} onClose={() => {setIsOpen(false)}}></MachineParamEditModal>

      </TableCell>

      <TableCell />

    </TableRow>
  )
}


export default BlockTableRow;
