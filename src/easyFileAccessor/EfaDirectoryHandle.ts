import {EfaHandle, FileSystemKind} from "./EfaHandle";
import {EfaFileHandle} from "./EfaFIleHandle";

export class EfaDirectoryHandle implements EfaHandle {
  readonly kind: FileSystemKind;
  readonly name: string;
  readonly path: string;
  readonly parentDirectory?: EfaDirectoryHandle;

  readonly childrenFiles: EfaFileHandle[];
  readonly childrenDirectories: EfaDirectoryHandle[]


  constructor (name: string, path: string, childrenFiles: FileSystemFileHandle[],parentDirectory? : EfaDirectoryHandle) {
    this.kind = 'directory';
    this.name = name;
    this.path = path;
    this.parentDirectory = parentDirectory;

    this.childrenFiles = [];
    for (const childrenFile of childrenFiles) {
      const filePath = path + '/' + childrenFile.name;
      this.childrenFiles.push(new EfaFileHandle(filePath,this,childrenFile))
    }

    this.childrenDirectories = [];
    parentDirectory?.addChildrenDirectory(this);
  }
  private addChildrenDirectory (children: EfaDirectoryHandle): void {
    this.childrenDirectories.push(children);
  }

}
