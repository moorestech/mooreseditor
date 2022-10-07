import {EfaDirectoryHandle} from "./EfaDirectoryHandle";

type OpenDirectoryMode =  'readwrite' | 'read';
type OpenDefaultDirectory = '' |'documents' | 'desktop' | 'downloads' | 'music' | 'pictures' | 'videos';

export async function createDirectory(handle :  FileSystemDirectoryHandle,parentPath : string,parentDirectory? : EfaDirectoryHandle) : Promise<EfaDirectoryHandle>{
  const files : FileSystemFileHandle[] = [];

  for await (const entry of handle.values()) {
    if (entry.kind === 'file'){
      files.push(entry);
    }
  }
  const directoryPath = parentPath + '/' + handle.name;
  const thisDirectory = new EfaDirectoryHandle(handle.name,directoryPath,handle,files,parentDirectory);


  for await (const entry of handle.values()) {
    if (entry.kind === 'directory'){
      await createDirectory(entry, directoryPath, thisDirectory);
    }
  }

  return thisDirectory;
}

export async function efaOpenDirectory(id = "", mode:OpenDirectoryMode = 'readwrite', defaultDirectory:OpenDefaultDirectory = ''): Promise<EfaDirectoryHandle> {

  //TODO 改善求む
  let dirHandle : FileSystemDirectoryHandle;
  if (defaultDirectory === ''){
    dirHandle = await window.showDirectoryPicker({
      id: id,
      mode: mode
    });
  }else{
    dirHandle = await window.showDirectoryPicker({
      id: id,
      startIn: defaultDirectory,
      mode: mode
    });
  }


  return await createDirectory(dirHandle, "", undefined);
}

export default efaOpenDirectory
