import {EfaDirectoryHandle} from "./EfaDirectoryHandle";
import {EfaHandle, FileSystemKind} from "./EfaHandle";

export class EfaFileHandle implements EfaHandle {
  readonly kind: FileSystemKind;
  readonly name: string;
  readonly path: string;
    
  private readonly parentDirectory: EfaDirectoryHandle;

  constructor(parentDirectory: EfaDirectoryHandle, name: string, path: string) {
    this.kind = 'file';
    this.name = name;
    this.parentDirectory = parentDirectory;
    this.path = path;
  }

  getParent(): EfaDirectoryHandle | undefined {
    return this.parentDirectory;
  }
}
