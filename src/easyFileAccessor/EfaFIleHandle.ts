import {EfaDirectoryHandle} from "./EfaDirectoryHandle";
import {EfaHandle, FileSystemKind} from "./EfaHandle";
import {FileWithDirectoryAndFileHandle} from "browser-fs-access";

export class EfaFileHandle implements EfaHandle {
  readonly kind: FileSystemKind;
  readonly name: string;
  readonly path: string;

  private readonly parentDirectory: EfaDirectoryHandle;

  constructor(parentDirectory: EfaDirectoryHandle,fileHandle : FileWithDirectoryAndFileHandle) {
    this.kind = 'file';
    this.name = fileHandle.name;
    this.path = fileHandle.webkitRelativePath;
    this.parentDirectory = parentDirectory;
  }

  getParent(): EfaDirectoryHandle | undefined {
    return this.parentDirectory;
  }
}
