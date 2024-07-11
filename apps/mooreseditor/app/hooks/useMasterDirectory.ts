import { useRef } from "react"
import { useFileSystemAccess } from "./useFileSystemAccess"

export const useMasterDirectory = () => {
  const fileSystem = useFileSystemAccess()
  const loadedMasterData = useRef<any>({})
  const selectDirectory = async () => {
    await fileSystem.selectDirectory()
    const fileHandle = await fileSystem.openFile('modMeta.json')
    if(!fileHandle){
      alert('modMeta.jsonが見つかりませんでした')
      return
    }
    fileSystem.changeDirectory('master', { create: true })
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
    const file = await fileHandle?.createWritable()
    if(!file) return
    await file.write(JSON.stringify(contents, null, 2))
    await file.close()
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
    state: fileSystem.state,
    selectDirectory,
    openMaster,
    saveMaster,
    getEntries,
    loadAllMasterData,
  }
}
