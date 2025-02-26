import { useRef, useState } from "react"
import { useFileSystemAccess } from "./useFileSystemAccess"

export const useMasterDirectory = () => {
  const fileSystem = useFileSystemAccess()
  const loadedMasterData = useRef<any>({})
  const [state, setState] = useState<"unloaded" | "loaded">("unloaded")
  const selectDirectory = async () => {
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
    const fileHandle = await fileSystem.openFile(`${schemaId}.json`)
    const file = await fileHandle?.getFile()
    const text = await file?.text()
    if(!text) return
    loadedMasterData.current[schemaId] = JSON.parse(text)
    return loadedMasterData.current[schemaId]
  }
  const saveMaster = async (schemaId: string, contents: any): Promise<void> => {
    const fileHandle = await fileSystem.openFile(`${schemaId}.json`)
    await fileSystem.saveFile(fileHandle, JSON.stringify(contents, null, 2))
    loadedMasterData.current[schemaId] = contents
  }
  const loadAllMasterData = async (schemaIds: Array<string>) => {
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
