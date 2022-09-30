import {directoryOpen} from "browser-fs-access";

type OpenDirectoryMode =  'readwrite' | 'read';
type OpenDefaultDirectory = 'documents' | 'desktop' | 'downloads' | 'music' | 'pictures' | 'videos';
async function efaOpenDirectory(id:string = "", mode:OpenDirectoryMode = 'readwrite', defaultDirectory:OpenDefaultDirectory = 'documents'): Promise<DirectoryHandle> {
    const dirHandle = await directoryOpen({recursive: true,});

    for await (const dir of dirHandle) {
        console.log(dir.webkitRelativePath);
    }

    return new DirectoryHandle(undefined,"","",[],[]);
}

export default efaOpenDirectory;