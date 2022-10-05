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


  //parentDirectoryをreadonlyにするために、parentDirectoryをセットし、自身の子ディレクトリを知らない状態でコンストラクトする
  constructor (name: string, path: string, childrenFiles: FileSystemFileHandle[],parentDirectory? : EfaDirectoryHandle) {
    this.kind = 'directory';
    this.name = name;
    this.path = path;
    this.parentDirectory = parentDirectory;
    this.isRoot = parentDirectory === undefined;

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

  //そのパスのファイルもしくはディレクトリが存在するかチェックする
  //パスの指定はこのインスタンスから見た相対パス
  isExist(path: string): boolean {
    if (path.length === 0){
      return true;
    }

    const pathArray = path.split('/');
    if (pathArray.length === 0){
      return true;
    }
    const nextPath = pathUtil.join(...pathArray.slice(1));

    //一文字目が / の場合、rootからのチェックになる
    if (path[0] === '/'){
      if (this.parentDirectory === undefined){
        //rootまでこれたのでrootのフォルダ名が正しいかチェックする 正しかったら子をチェックする

        // /hoge の状態の時配列は['','hoge']になるので、rootだけの指定かどうかをチェックする
        if (pathArray[1] === this.name && pathArray.length == 2){
          return true;
        }else if (pathArray[1] === this.name){
          // /hoge/fuga の状態の時は fugaにして子をチェックする
          const rootNextPath = pathUtil.join(...pathArray.slice(2));

          return this.isExist(rootNextPath);
        }

        return false;
      }else{
        return this.parentDirectory.isExist(path);
      }
    }



    // . なのでtrueを返す
    if (pathArray[0] === '.' && pathArray.length === 1){
      return true;
    }

    // ./hoge なので.を除いてチェック
    if (pathArray[0] === '.'){

      return this.isExist(nextPath)
    }

    // ../hoge なので親ディレクトリをチェック
    if (pathArray[0] === '..'){
      if (this.parentDirectory === undefined){
        return false;
      }else{
        return this.parentDirectory.isExist(nextPath);
      }
    }

    //子ディレクトリをチェック
    for (const childrenDirectory of this.childrenDirectories) {
      if (childrenDirectory.name == pathArray[0]){
        return childrenDirectory.isExist(nextPath);
      }
    }


    return false;
  }

}
