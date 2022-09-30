type FileSystemKind = 'file' | 'directory';
interface EasyFileAccessorHandle {
    readonly kind: FileSystemKind;
    readonly name: string;
    readonly path: string;
    readonly parentDirectory: DirectoryHandle | undefined;
}