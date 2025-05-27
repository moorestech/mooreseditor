import { useRef, useState } from "react"
import { useFileSystemAccess } from "./useFileSystemAccess"

// test data imports for dev environment
import devBlocks from '../../../../testMod/master/blocks.json'
import devItems from '../../../../testMod/master/items.json'
import devCraftRecipes from '../../../../testMod/master/craftRecipes.json'
import devMachineRecipes from '../../../../testMod/master/machineRecipes.json'
import devMapObjects from '../../../../testMod/master/mapObjects.json'
import devChallenges from '../../../../testMod/master/challenges.json'

const DEV_MODE = import.meta.env.DEV

const devData = {
  items: devItems,
  blocks: devBlocks,
  craftRecipes: devCraftRecipes,
  machineRecipes: devMachineRecipes,
  mapObjects: devMapObjects,
  challenges: devChallenges,
}

export const useMasterDirectory = () => {
  const fileSystem = useFileSystemAccess()
  const loadedMasterData = useRef<any>(DEV_MODE ? devData : {})
  const [state, setState] = useState<"unloaded" | "loaded">(DEV_MODE ? "loaded" : "unloaded")
  const selectDirectory = async () => {
    if(DEV_MODE) {
      setState("loaded")
      return
    }
    setState("unloaded")
    await fileSystem.selectDirectory()
    const fileHandle = await fileSystem.openFile('modMeta.json')
    if(!fileHandle){
      alert('modMeta.jsonが見つかりませんでした')
      return
    }
    await fileSystem.changeDirectory('master', { create: true })
    setState("loaded")
  }
  const openMaster = async (schemaId: string): Promise<any | undefined> => {
    if(DEV_MODE) {
      return loadedMasterData.current[schemaId]
    }
    const fileHandle = await fileSystem.openFile(`${schemaId}.json`)
    const file = await fileHandle?.getFile()
    const text = await file?.text()
    if(!text) return
    loadedMasterData.current[schemaId] = JSON.parse(text)
    return loadedMasterData.current[schemaId]
  }
  const saveMaster = async (schemaId: string, contents: any): Promise<void> => {
    if(DEV_MODE) {
      loadedMasterData.current[schemaId] = contents
      return
    }
    const fileHandle = await fileSystem.openFile(`${schemaId}.json`)
    await fileSystem.saveFile(fileHandle, JSON.stringify(contents, null, 2))
    loadedMasterData.current[schemaId] = contents
  }
  const loadAllMasterData = async (schemaIds: Array<string>) => {
    if(DEV_MODE) return
    return Promise.all(schemaIds.map(async schemaId => {
      await openMaster(schemaId)
    }))
  }
  const getEntries = (schemaId: string) => {
    return loadedMasterData.current[schemaId]
  }
  return {
    state,
    selectDirectory,
    openMaster,
    saveMaster,
    getEntries,
    loadAllMasterData,
  }
}
