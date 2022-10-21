// ** React Imports
import React from 'react'

// ** MUI Imports
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import {Button, Select} from "@mui/material";
import Pencil from 'mdi-material-ui/pencil';
import IconButton from "@mui/material/IconButton";
import MachineParamEditModal from "../modal/MachineParamEditModal";
import {Block} from "../../mod/element/Block";
import TextField from "@mui/material/TextField";
import Mod from "../../mod/loader/Mod";
import SelectBlockType from "../../mod/component/SelectBlockType";
import SelectItemModal from "../modal/SelectItemModal";
import {ItemConfigUtil} from "../../mod/util/ItemConfigUtil";


const BlockTableRow = (props: { row: Block ,onEdit:(block: Block) => void}) => {
  const [isOpen, setIsOpen] = React.useState(false);


  const itemModId = props.row.itemModId;
  const itemName = props.row.itemName;

  const itemImagUrl = ItemConfigUtil.GetItem(itemModId,itemName,Mod.instance.itemConfig.items)?.imageUrl;


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
        <IconButton aria-label='expand row' size='small'
                    onClick={async () =>{
                      const itemModId = props.row.itemModId;
                      const itemName = props.row.itemName;
                      try {
                        const item = ItemConfigUtil.GetItem(itemModId,itemName,Mod.instance.itemConfig.items);

                        const newBlock = new Block(props.row.name,props.row.type,itemModId,itemName,props.row.modelTransform,props.row.param);
                        props.onEdit(newBlock);
                      }catch (e) {
                        console.log(e)
                      }
                    }}>
          <img src={props.row.imageUrl} alt={props.row.name} width={40} height={40} />
        </IconButton>
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
