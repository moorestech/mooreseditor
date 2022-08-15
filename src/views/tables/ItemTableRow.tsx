// ** React Imports
import React, {useEffect, useRef, useState} from 'react'

// ** MUI Imports
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'

// ** Icons Imports
import TextField from "@mui/material/TextField";

interface ItemTableRowProps {
  name: string;
  maxStacks: number;
}

const SedEditeState = (ref: React.RefObject<HTMLDivElement>,editAction: (state:boolean) => void) => {
  const keyDownHandler = (event : KeyboardEvent) => {

    if (event.key === 'Enter' || event.key === 'Escape') {
      event.preventDefault();
      editAction(false);
    }
  }
  document.addEventListener('keydown', keyDownHandler);;



  const el = ref.current;
  if (!el) return;
  const handleClickOutside = (e: MouseEvent) => {
    editAction(el?.contains(e.target as Node));
  };
  document.addEventListener("click", handleClickOutside);

  return () => {
    document.removeEventListener("click", handleClickOutside);
    document.removeEventListener('keydown',keyDownHandler);
  }
}

const ItemTableRow = (props: { row: ItemTableRowProps }) => {

  const { row } = props
  const [editName,setEditName] = useState<boolean>(false);
  const [editMaxStacks,setMaxStacks] = useState<boolean>(false);



  const editNameRef = useRef<HTMLDivElement>(null);
  useEffect(() => {SedEditeState(editNameRef,setEditName)}, []);

  const editMaxStacksRef = useRef<HTMLDivElement>(null);
  useEffect(() => {SedEditeState(editMaxStacksRef,setMaxStacks)}, []);



  return (
    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
      <TableCell>
        <img src='/images/logos/mastercard-label.png' alt='testItem' width={40} height={40} />
      </TableCell>

      <TableCell component='th' scope='row' ref={editNameRef}>
        {
          editName ?
            <TextField fullWidth label='Name' placeholder='Item Name' size={"small"} defaultValue={row.name} autoFocus={true} onFocus={e => e.target.select()}/> :
            <p>{row.name}</p>
        }
      </TableCell>

      <TableCell align='right' ref={editMaxStacksRef}>
        {
          editMaxStacks ?
            <TextField fullWidth label='MaxStacks' placeholder='Max Stacks' size={"small"} defaultValue={row.maxStacks} autoFocus={true} type='number'  onFocus={e => e.target.select()}/> :
            <p>{row.maxStacks}</p>
        }
      </TableCell>
      <TableCell />
    </TableRow>
  )
}


export default ItemTableRow;
