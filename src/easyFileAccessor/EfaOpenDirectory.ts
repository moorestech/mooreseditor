import {directoryOpen} from "browser-fs-access";
import {EfaDirectoryHandle} from "./EfaDirectoryHandle";

type OpenDirectoryMode =  'readwrite' | 'read';
type OpenDefaultDirectory = 'documents' | 'desktop' | 'downloads' | 'music' | 'pictures' | 'videos';
async function efaOpenDirectory(id:string = "", mode:OpenDirectoryMode = 'readwrite', defaultDirectory:OpenDefaultDirectory = 'documents'): Promise<DirectoryHandle> {
    const files = await directoryOpen({recursive: true,});


    for await (const file of files) {
        console.log(await file.directoryHandle);
    }

    return new EfaDirectoryHandle(undefined,"","",[],[]);
}

export default efaOpenDirectory;
