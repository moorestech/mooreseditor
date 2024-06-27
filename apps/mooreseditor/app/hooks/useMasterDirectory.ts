import { useFileSystemAccess } from "./useFileSystemAccess"

export const useMasterDirectory = () => {
  const fileSystem = useFileSystemAccess()
  const selectDirectory = async () => {
    const dir = await fileSystem.selectDirectory()
    dir.getDirectoryHandle('master', { create: true })
  }
  const openMaster = async (schemaId: string): Promise<string | undefined> => {
    const fileHandle = await fileSystem.openFile(`${schemaId}.json`)
    const file = await fileHandle?.getFile()
    const text = await file?.text()
    if(!text) return
    return JSON.parse(text)
  }
  const saveMaster = async (schemaId: string, contents: any): Promise<void> => {
    const fileHandle = await fileSystem.openFile(`${schemaId}.json`)
    const file = await fileHandle?.createWritable()
    if(!file) return
    await file.write(JSON.stringify(contents))
    await file.close()
  }
  return {
    state: fileSystem.state,
    selectDirectory,
    openMaster,
    saveMaster
  }
}
