// ** React Imports
import React, { useEffect, useState } from 'react'

// ** MUI Imports
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'

// ** Icons Imports
import IconButton from '@mui/material/IconButton'
import Plus from 'mdi-material-ui/Plus'
import ItemTableRow from './ItemTableRow'
import {Item, NoneItemIconUrl} from '../../mod/element/Item'
import Mod from '../../mod/loader/Mod'
import CreateItemModal from '../modal/CreateItemModal'

function ItemTable() {
  const [itemRows, setItemRows] = useState<ReadonlyArray<Item>>(Mod.instance ? Mod.instance.itemConfig.items : [])
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false)

  const modId = Mod.instance?.meta.mergedId

  useEffect(() => {
    const subscription = Mod.onModUpdate.subscribe(mod => {
      setItemRows(mod.itemConfig.items)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [itemRows])

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
          {itemRows.map((item, index) => {
            return (
              <ItemTableRow
                key={index}
                row={item}
                onEdit={item => {
                  const newItems = [...itemRows]
                  newItems[index] = item
                  setItemRows(newItems)
                  Mod.instance?.itemConfig.changeItems(newItems)
                }}
              />
            )
          })}

          <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
            <TableCell>
              <IconButton aria-label='expand row' size='small' onClick={() => setCreateModalOpen(true)}>
                <Plus />
              </IconButton>
              <CreateItemModal
                isOpen={createModalOpen}
                onClose={() => {
                  setCreateModalOpen(false)
                }}
                onSubmit={async (itemName, maxStack) => {
                  const addedRow = itemRows.concat(new Item(modId, itemName, maxStack, NoneItemIconUrl, ''))
                  await Mod.instance.itemConfig.changeItems(addedRow)
                  setItemRows(addedRow)
                }}
              ></CreateItemModal>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ItemTable
