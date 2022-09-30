class FileHandle implements EasyFileAccessorHandle{
    readonly kind: FileSystemKind;
    readonly name: string;
    readonly parentDirectory: DirectoryHandle;
    readonly path: string;

    constructor(parentDirectory: DirectoryHandle, name: string, path: string){
        this.kind = 'file';
        this.name = name;
        this.parentDirectory = parentDirectory;
        this.path = path;
    }
}