import {EfaDirectoryHandle} from "./EfaDirectoryHandle";

export type FileSystemKind = 'file' | 'directory';
export interface EfaHandle {
    readonly kind: FileSystemKind;
    readonly name: string;
    readonly path: string;
    readonly parentDirectory: EfaDirectoryHandle | undefined;
}
