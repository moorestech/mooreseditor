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
import MachineRecipeTableRow from "./MachineRecipeTableRow";
import {MachineRecipe} from "../../mod/element/MachineRecipe";
import Mod from "../../mod/loader/Mod";

function MachineRecipeTable() {
  const [machineRecipes, setMachineRecipes] = useState<ReadonlyArray<MachineRecipe>>(Mod.instance?.machineRecipeConfig.MachineRecipes ?? []);

  const items = Mod.instance?.itemConfig.items;

  useEffect(() => {
    const subscription = Mod.onModUpdate.subscribe((mod) => {
      setMachineRecipes(mod.machineRecipeConfig.MachineRecipes);
    })

    return () => {
      subscription.unsubscribe();
    }
  }, [machineRecipes]);

  return (
    <TableContainer component={Paper}>
      <Table aria-label='collapsible table'>

        <TableHead>
          <TableRow>
            <TableCell>Block Name</TableCell>
            <TableCell>Input Item</TableCell>
            <TableCell>Output Item</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {
            machineRecipes.map((recipe, index) => {
              const name =  Mod.instance?.blockConfig.blocks[recipe.BlockId].name??'';

              return <MachineRecipeTableRow key={index} blockName={name} recipe={recipe} items={items}/>
            })}

          <TableRow sx={{'& > *': {borderBottom: 'unset'}}}>
            <TableCell>
              <IconButton aria-label='expand row' size='small'>
                <Plus/>
              </IconButton>
            </TableCell>
          </TableRow>

        </TableBody>

      </Table>
    </TableContainer>
  )
}


export default MachineRecipeTable
