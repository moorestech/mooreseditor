// ** React Imports
import React, {useEffect, useRef, useState} from 'react'

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
import Plus from 'mdi-material-ui/Plus';

const createData = (name: string, maxStacks: number) => {
  return {
    name,
    maxStacks,
  }
}

const Row = (props: { row: ReturnType<typeof createData> }) => {
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

const rows = [
  createData('Frozen yoghurt', 159),
]

function ItemTable() {
  const [copiedRow, setRows] = useState<{name: string, maxStacks: number}[]>(rows);

  const rowsTag = copiedRow.map(row => {
    return <Row key={row.name} row={row} />
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
