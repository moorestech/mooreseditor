import React from 'react'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Pencil from 'mdi-material-ui/pencil';
import IconButton from "@mui/material/IconButton";
import MachineParamEditModal from "../modal/MachineParamEditModal";
import {Block} from "../../mod/element/Block";
import TextField from "@mui/material/TextField";
import Mod from "../../mod/loader/Mod";
import SelectBlockType from "../../mod/component/SelectBlockType";
import SelectItemModal from "../modal/SelectItemModal";
import {ItemConfigUtil} from "../../mod/util/ItemConfigUtil";
import EditBlockParamModal from "../modal/EditBlockParamModal";


const BlockTableRow = (props: { row: Block ,onEdit:(block: Block) => void}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isItemOpen, setIsItemOpen] = React.useState(false);

  const itemImagUrl = ItemConfigUtil.GetItem(props.row.itemName,props.row.itemModId,Mod.instance.itemConfig.items)?.imageUrl;
  const itemNameText = ItemConfigUtil.GetItem(props.row.itemName,props.row.itemModId,Mod.instance.itemConfig.items)?.name;

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
        <IconButton aria-label='expand row' size='small' onClick={() => setIsItemOpen(true)}>
          <img src={itemImagUrl} alt={itemNameText} width={40} height={40} />
        </IconButton>
        <SelectItemModal
          isOpen={isItemOpen} onClose={() => {setIsItemOpen(false)}}
          onSelect={async (item) =>{
            setIsItemOpen(false)
            try {
              const itemModId = item.modId
              const itemName = item.name

              const newBlock = new Block(props.row.name,props.row.type,itemModId,itemName,props.row.modelTransform,props.row.param);
              props.onEdit(newBlock);
            }catch (e) {
              console.log(e)
            }}} />
      </TableCell>

      <TableCell>
        <IconButton aria-label='expand row' size='small' onClick={() => setIsOpen(true)}>
          <Pencil/>
        </IconButton>

        <EditBlockParamModal
          isOpen={isOpen} onClose={() => {setIsOpen(false)}} param={props.row.param} type={props.row.type}
          onSubmit={param => {
            const newBlock = new Block(props.row.name,props.row.type,props.row.itemModId,props.row.itemName,props.row.modelTransform,param);
            props.onEdit(newBlock);
            setIsOpen(false)
          }} />

      </TableCell>

      <TableCell />

    </TableRow>
  )
}


export default BlockTableRow;
