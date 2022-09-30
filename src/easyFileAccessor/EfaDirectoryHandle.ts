import {EfaHandle, FileSystemKind} from "./EfaHandle";
import {EfaFileHandle} from "./EfaFIleHandle";

export class EfaDirectoryHandle implements EfaHandle {
  readonly kind: FileSystemKind;
  readonly name: string;
  readonly path: string;

  readonly childrenFiles: EfaFileHandle[];
  readonly childrenDirectories: EfaDirectoryHandle[]


  private parentDirectory: EfaDirectoryHandle | undefined;


  constructor (name: string, path: string, childrenFiles: EfaFileHandle[], childrenDirectories: EfaDirectoryHandle[]) {
    this.kind = 'directory';
    this.name = name;
    this.path = path;
    this.childrenFiles = childrenFiles;
    this.childrenDirectories = childrenDirectories;

    for (const childrenDirectory of childrenDirectories) {
      childrenDirectory.setParent(this);
    }
  }

  public getParent (): EfaDirectoryHandle | undefined {
    return this.parentDirectory;
  }

  private setParent (parentDirectory: EfaDirectoryHandle): void {
    this.parentDirectory = parentDirectory;
  }

}
