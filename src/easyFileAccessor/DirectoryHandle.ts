class DirectoryHandle implements EasyFileAccessorHandle{
    readonly kind: FileSystemKind;
    readonly name: string;
    readonly parentDirectory: DirectoryHandle | undefined;
    readonly path: string;

    readonly childrenFiles: FileHandle[];
    readonly childrenDirectories: DirectoryHandle[]

    constructor(parentDirectory: DirectoryHandle | undefined, name: string, path: string, childrenFiles: FileHandle[], childrenDirectories: DirectoryHandle[]){
        this.kind = 'directory';
        this.name = name;
        this.parentDirectory = parentDirectory;
        this.path = path;
        this.childrenFiles = childrenFiles;
        this.childrenDirectories = childrenDirectories;
    }

}