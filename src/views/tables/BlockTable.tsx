import React, { useEffect, useState } from 'react'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import IconButton from '@mui/material/IconButton'
import Plus from 'mdi-material-ui/Plus'
import BlockTableRow from './BlockTableRow'
import Mod from '../../mod/loader/Mod'
import { Block } from '../../mod/element/Block'
import { Transform } from '../../mod/element/Transform'
import { Vector3 } from '../../mod/element/Vector3'

function BlockTable() {
  const [blockRows, setBlockRows] = useState<ReadonlyArray<Block>>(Mod.instance ? Mod.instance.blockConfig.blocks : [])

  useEffect(() => {
    const subscription = Mod.onModUpdate.subscribe(mod => {
      setBlockRows(mod.blockConfig.blocks)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [blockRows])

  return (
    <TableContainer component={Paper}>
      <Table aria-label='collapsible table'>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Item</TableCell>
            <TableCell>Edit</TableCell>
            <TableCell>Delete</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>

        <TableBody>
          {blockRows.map((item, index) => {
            return (
              <BlockTableRow
                key={item.name}
                row={item}
                onEdit={block => {
                  const newBlocks = [...blockRows]
                  newBlocks[index] = block
                  setBlockRows(newBlocks)
                  Mod.instance?.blockConfig.changeBlocks(newBlocks)
                }}
                onDelete={() => {
                  const newBlocks = [...blockRows]
                  newBlocks.splice(index, 1)
                  setBlockRows(newBlocks)
                  Mod.instance?.blockConfig.changeBlocks(newBlocks)
                }}
              />
            )
          })}

          <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
            <TableCell>
              <IconButton
                aria-label='expand row'
                size='small'
                onClick={() => {
                  const addedRow = blockRows.concat(
                    new Block(
                      'new block' + Math.floor(Math.random() * 1000),
                      'block',
                      '',
                      '',
                      1,1,
                      new Transform(Vector3.zero, Vector3.zero, Vector3.one),
                      {}
                    )
                  )
                  Mod.instance?.blockConfig.changeBlocks(addedRow)
                  setBlockRows(addedRow)
                }}
              >
                <Plus />
              </IconButton>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default BlockTable
