import { useFileSystemAccess } from "./useFileSystemAccess"

export const useMasterDirectory = () => {
  const fileSystem = useFileSystemAccess()
  const selectDirectory = async () => {
    await fileSystem.selectDirectory()
    const fileHandle = await fileSystem.openFile('modMeta.json')
    if(!fileHandle){
      alert('modMeta.jsonが見つかりませんでした')
      return
    }
    fileSystem.changeDirectory('master', { create: true })
  }
  const openMaster = async (schemaId: string): Promise<string | undefined> => {
    const fileHandle = await fileSystem.openFile(`${schemaId}.json`)
    console.log(fileHandle)
    const file = await fileHandle?.getFile()
    const text = await file?.text()
    if(!text) return
    console.log(text)
    return JSON.parse(text)
  }
  const saveMaster = async (schemaId: string, contents: any): Promise<void> => {
    const fileHandle = await fileSystem.openFile(`${schemaId}.json`)
    const file = await fileHandle?.createWritable()
    if(!file) return
    await file.write(JSON.stringify(contents, null, 2))
    await file.close()
  }
  return {
    state: fileSystem.state,
    selectDirectory,
    openMaster,
    saveMaster
  }
}
