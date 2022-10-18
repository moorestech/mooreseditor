// ** React Imports
import React, {useEffect, useState} from 'react'

// ** MUI Imports
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'

// ** Icons Imports
import IconButton from "@mui/material/IconButton";
import Plus from 'mdi-material-ui/Plus';
import CraftRecipeTableRow from "./CraftRecipeTableRow";
import {CraftRecipe} from "../../mod/element/CraftRecipe";
import Mod from "../../mod/loader/Mod";


function CraftRecipeTable() {
  const [craftRecipes, setCraftRecipes] = useState<ReadonlyArray<CraftRecipe>>(Mod.instance? Mod.instance.craftRecipeConfig.CraftRecipes : []);

  useEffect(() => {
    const subscription = Mod.onModUpdate.subscribe((mod) => {setCraftRecipes(mod.craftRecipeConfig.CraftRecipes);})

    return () => {subscription.unsubscribe();}
  }, [craftRecipes]);

  return (
    <TableContainer component={Paper}>
      <Table aria-label='collapsible table'>

        <TableHead>
          <TableRow>
            <TableCell>Craft Item</TableCell>
            <TableCell></TableCell>
            <TableCell>Edit</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          { craftRecipes.map((recipe,index) => {
            return <CraftRecipeTableRow key={index} recipe={recipe} items={Mod.instance?.itemConfig.items} />
          }) }

          <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
            <TableCell>
              <IconButton aria-label='expand row' size='small' onClick={() => {
                //TODO レシピ作成モーダルを出す
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


export default CraftRecipeTable
