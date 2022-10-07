import {EfaHandle, FileSystemKind} from "./EfaHandle";
import {EfaFileHandle} from "./EfaFIleHandle";
import * as pathUtil from 'path';

export class EfaDirectoryHandle implements EfaHandle {
  readonly kind: FileSystemKind;
  readonly name: string;
  readonly path: string;
  readonly parentDirectory?: EfaDirectoryHandle;
  readonly isRoot : boolean;

  readonly childrenFiles: EfaFileHandle[];
  readonly childrenDirectories: EfaDirectoryHandle[]

  private readonly directoryHandle : FileSystemDirectoryHandle;

  //parentDirectoryをreadonlyにするために、parentDirectoryをセットし、自身の子ディレクトリを知らない状態でコンストラクトする
  constructor (name: string, path: string,directoryHandle : FileSystemDirectoryHandle, childrenFiles: FileSystemFileHandle[],parentDirectory? : EfaDirectoryHandle) {
    this.kind = 'directory';
    this.name = name;
    this.path = path;
    this.parentDirectory = parentDirectory;
    this.isRoot = parentDirectory === undefined;
    this.directoryHandle = directoryHandle;

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

  async createFile(name: string): Promise<EfaFileHandle> {
    const fileHandle = await this.directoryHandle.getFileHandle(name,{create: true});
    const filePath = this.path + '/' + name;
    const file = new EfaFileHandle(filePath,this,fileHandle);
    this.childrenFiles.push(file);

    return file;
  }

  async createDirectory(name: string): Promise<EfaDirectoryHandle> {
    const directoryHandle = await this.directoryHandle.getDirectoryHandle(name,{create: true});
    const directoryPath = this.path + '/' + name;
    const directory = new EfaDirectoryHandle(name,directoryPath,directoryHandle,[],this);
    this.childrenDirectories.push(directory);

    return directory;
  }

  //そのパスのファイルもしくはディレクトリが存在するかチェックする
  //パスの指定はこのインスタンスから見た相対パス
  isExist(path: string): boolean {
    return this.getHandle(path) !== undefined;
  }

  getDirectoryHandle(path: string): EfaDirectoryHandle {
    const handle = this.getHandle(path);
    if (handle === undefined || handle.kind === 'file'){
      throw new Error("Not found file");
    }
    if (handle.kind === 'directory'){
      return handle as EfaDirectoryHandle;
    }
    throw new Error("Not found file");
  }

  getFileHandle(path: string): EfaFileHandle {
    const handle = this.getHandle(path);
    if (handle === undefined || handle.kind === 'directory'){
      throw new Error("Not found file");
    }
    if (handle.kind === 'file'){
      return handle as EfaFileHandle;
    }
    throw new Error("Not found file");
  }

  private getHandle(path: string): EfaHandle | undefined {

    if (path.length === 0){
      return this;
    }

    const pathArray = path.split('/');
    if (pathArray.length === 0){
      return this;
    }
    const nextPath = pathUtil.join(...pathArray.slice(1));

    //一文字目が / の場合、rootからのチェックになる
    if (path[0] === '/'){
      if (this.parentDirectory === undefined){
        //rootまでこれたのでrootのフォルダ名が正しいかチェックする 正しかったら子をチェックする

        // /hoge の状態の時配列は['','hoge']になるので、rootだけの指定かどうかをチェックする
        if (pathArray[1] === this.name && pathArray.length == 2){
          return this;
        }else if (pathArray[1] === this.name){
          // /hoge/fuga の状態の時は fugaにして子をチェックする
          const rootNextPath = pathUtil.join(...pathArray.slice(2));

          return this.getHandle(rootNextPath);
        }

        return undefined;
      }else{
        return this.parentDirectory.getHandle(path);
      }
    }



    // . なのでtrueを返す
    if (pathArray[0] === '.' && pathArray.length === 1){
      return this;
    }

    // ./hoge なので.を除いてチェック
    if (pathArray[0] === '.'){

      return this.getHandle(nextPath)
    }

    // ../hoge なので親ディレクトリをチェック
    if (pathArray[0] === '..'){
      if (this.parentDirectory === undefined){
        return undefined;
      }else{
        return this.parentDirectory.getHandle(nextPath);
      }
    }

    //子ディレクトリをチェック
    for (const childrenDirectory of this.childrenDirectories) {
      if (childrenDirectory.name === pathArray[0]){
        return childrenDirectory.getHandle(nextPath);
      }
    }

    //子ファイルをチェック
    if (pathArray.length === 1){
      for (const childrenFile of this.childrenFiles) {
        if (childrenFile.name === pathArray[0]){
          return childrenFile;
        }
      }
    }

    return undefined;
  }

}
