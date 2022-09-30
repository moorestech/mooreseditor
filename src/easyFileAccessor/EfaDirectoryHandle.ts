import {EfaHandle, FileSystemKind} from "./EfaHandle";
import {EfaFileHandle} from "./EfaFIleHandle";

export class EfaDirectoryHandle implements EfaHandle{
    readonly kind: FileSystemKind;
    readonly name: string;
    readonly parentDirectory: EfaDirectoryHandle | undefined;
    readonly path: string;

    readonly childrenFiles: EfaFileHandle[];
    readonly childrenDirectories: EfaDirectoryHandle[]

    constructor(parentDirectory: EfaDirectoryHandle | undefined, name: string, path: string, childrenFiles: EfaFileHandle[], childrenDirectories: EfaDirectoryHandle[]){
        this.kind = 'directory';
        this.name = name;
        this.parentDirectory = parentDirectory;
        this.path = path;
        this.childrenFiles = childrenFiles;
        this.childrenDirectories = childrenDirectories;
    }

}
