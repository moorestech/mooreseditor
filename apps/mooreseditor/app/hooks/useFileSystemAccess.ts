import { useRef, useState } from "react"

export const useFileSystemAccess = () => {
  const dirHandleRef = useRef<FileSystemDirectoryHandle | null>(null)
  const [state, setState] = useState<"unloaded" | "loaded">("unloaded")
  const selectDirectory = async () => {
    const dirHandle = await showDirectoryPicker({
      mode: "readwrite"
    })
    if(!dirHandle) return
    dirHandleRef.current = dirHandle
    setState("loaded")
    return dirHandle
  }
  const getEntries = async () => {
    if(!dirHandleRef.current) return
    return dirHandleRef.current?.entries()
  }
  const changeDirectory = async (baseDirHandle: FileSystemDirectoryHandle, dirName: string, opts: FileSystemGetDirectoryOptions) => {
    setState("unloaded")
    const dirHandle = await baseDirHandle.getDirectoryHandle(dirName, opts)
    dirHandleRef.current = dirHandle
    setState("loaded")
  }
  const openFile = async (fileName: string) => {
    return dirHandleRef.current?.getFileHandle(fileName, { create: true })
  }
  const saveFile = async (fileHandle: any, contents: string) => {
    if(!fileHandle) return
    const file = await fileHandle.createWritable()
    await file.write(contents)
    await file.close()
  }
  return {
    state,
    selectDirectory,
    changeDirectory,
    getEntries,
    openFile,
    saveFile
  }
}
