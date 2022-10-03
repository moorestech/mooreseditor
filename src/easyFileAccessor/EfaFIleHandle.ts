import {EfaDirectoryHandle} from "./EfaDirectoryHandle";
import {EfaHandle, FileSystemKind} from "./EfaHandle";

export class EfaFileHandle implements EfaHandle {
  readonly kind: FileSystemKind;
  readonly name: string;
  readonly path: string;
  readonly parentDirectory: EfaDirectoryHandle;

  constructor(path : string,parentDirectory: EfaDirectoryHandle,fileHandle : FileSystemFileHandle) {
    this.kind = 'file';
    this.name = fileHandle.name;
    this.path = path;
    this.parentDirectory = parentDirectory;
  }
}
