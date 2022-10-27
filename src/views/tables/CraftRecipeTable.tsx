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
import {CraftRecipe, CraftRecipeItem, CraftResultItem} from "../../mod/element/CraftRecipe";
import Mod from "../../mod/loader/Mod";
import CraftRecipeEditModal from "../modal/CraftRecipeEditModal";


function CraftRecipeTable() {
  const [craftRecipes, setCraftRecipes] = useState<ReadonlyArray<CraftRecipe>>(Mod.instance ? Mod.instance.craftRecipeConfig.CraftRecipes : []);
  const [isNewCraftRecipeModalOpen, setIsNewCraftRecipeModalOpen] = useState<boolean>(false);
  const createTempRecipe = () => {
    //仮のレシピを作成する
    const craftRecipes: CraftRecipeItem[] = [];
    for (let i = 0; i < 9; i++) {
      craftRecipes.push(new CraftRecipeItem(undefined, undefined, 0))
    }

    return new CraftRecipe(new CraftResultItem(undefined, undefined, 0), craftRecipes)
  }

  useEffect(() => {
    const subscription = Mod.onModUpdate.subscribe((mod) => {
      setCraftRecipes(mod.craftRecipeConfig.CraftRecipes);
    })

    return () => {
      subscription.unsubscribe();
    }
  }, [craftRecipes]);

  return (
    <TableContainer component={Paper}>
      <Table aria-label='collapsible table'>

        <TableHead>
          <TableRow>
            <TableCell>Craft Item</TableCell>
            <TableCell></TableCell>
            <TableCell>Edit</TableCell>
            <TableCell>Delete</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {craftRecipes.map((recipe, index) => {
            return <CraftRecipeTableRow
              key={index} recipe={recipe} items={Mod.instance?.itemConfig.items ?? []}
              onSubmit={(recipe) => {
                const newRecipes = [...craftRecipes];
                newRecipes[index] = recipe;
                setCraftRecipes(newRecipes);
                Mod.instance?.craftRecipeConfig.changeRecipes(newRecipes);
              }}
              onDelete={()=>{
                const newRecipes = [...craftRecipes];
                newRecipes.splice(index,1);
                setCraftRecipes(newRecipes);
                Mod.instance?.craftRecipeConfig.changeRecipes(newRecipes);
              }}/>
          })}

          <TableRow sx={{'& > *': {borderBottom: 'unset'}}}>
            <TableCell>
              <IconButton aria-label='expand row' size='small' onClick={() => {
                setIsNewCraftRecipeModalOpen(true)
              }}>
                <Plus/>
              </IconButton>
              <CraftRecipeEditModal
                isOpen={isNewCraftRecipeModalOpen} recipe={createTempRecipe()}
                items={Mod.instance?.itemConfig.items ?? []} onClose={() => {
                setIsNewCraftRecipeModalOpen(false)
              }}
                onSubmit={recipe => {
                  const newRecipes = [...craftRecipes, recipe];
                  setCraftRecipes(newRecipes);
                  Mod.instance?.craftRecipeConfig.changeRecipes(newRecipes);
                  setIsNewCraftRecipeModalOpen(false);
                }}></CraftRecipeEditModal>
            </TableCell>
          </TableRow>

        </TableBody>

      </Table>
    </TableContainer>
  )
}


export default CraftRecipeTable
