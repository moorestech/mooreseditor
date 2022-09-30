import {EfaHandle, FileSystemKind} from "./EfaHandle";
import {EfaFileHandle} from "./EfaFIleHandle";

export class EfaDirectoryHandle implements EfaHandle {
  readonly kind: FileSystemKind;
  readonly name: string;
  readonly path: string;

  readonly childrenFiles: EfaFileHandle[];
  readonly childrenDirectories: EfaDirectoryHandle[]


  private parentDirectory: EfaDirectoryHandle | undefined;


  constructor (parentDirectory : EfaDirectoryHandle | undefined,name: string, path: string, childrenFiles: EfaFileHandle[]) {
    this.kind = 'directory';
    this.name = name;
    this.path = path;
    this.childrenFiles = childrenFiles;

    this.childrenDirectories = [];
    parentDirectory?.addChildrenDirectory(this);
  }

  public getParent (): EfaDirectoryHandle | undefined {
    return this.parentDirectory;
  }

  private addChildrenDirectory (children: EfaDirectoryHandle): void {
    this.childrenDirectories.push(children);
  }

}
