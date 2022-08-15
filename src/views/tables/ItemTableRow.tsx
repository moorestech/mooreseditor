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


const ItemTableRow = (props: { row: ItemTableRowProps }) => {

  const { row } = props
  const [editName,setEditName] = useState<boolean>(false);
  const [editMaxStacks,setMaxStacks] = useState<boolean>(false);

  const insideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    //対象の要素を取得
    const el = insideRef.current;

    //対象の要素がなければ何もしない
    if (!el) return;

    //クリックした時に実行する関数
    const handleClickOutside = (e: MouseEvent) => {
      if (el?.contains(e.target as Node)) {
        setEditName(true)
      } else {
        setEditName(false)
      }
    };

    //クリックイベントを設定
    document.addEventListener("click", handleClickOutside);

    //クリーンアップ関数
    return () => {
      //コンポーネントがアンマウント、再レンダリングされたときにクリックイベントを削除
      document.removeEventListener("click", handleClickOutside);
    }});

  return (
    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
      <TableCell>
        <img src='/images/logos/mastercard-label.png' alt='testItem' width={40} height={40} />
      </TableCell>

      <TableCell component='th' scope='row' ref={insideRef}>
        {
          editName ?
            <TextField fullWidth label='Name' placeholder='Item Name' size={"small"} defaultValue={row.name} autoFocus={true} /> :
            <p>{row.name}</p>
        }
      </TableCell>
      <TableCell align='right'>
        {
          editMaxStacks ?
            <TextField fullWidth label='MaxStacks' placeholder='row.maxStacks' size={"small"} defaultValue={row.maxStacks} autoFocus={true} type='number'  /> :
            <p>{row.maxStacks}</p>
        }
      </TableCell>
      <TableCell />
    </TableRow>
  )
}


export default ItemTableRow;
