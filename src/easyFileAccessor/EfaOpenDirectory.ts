import {directoryOpen, FileWithDirectoryAndFileHandle} from "browser-fs-access";
import {EfaDirectoryHandle} from "./EfaDirectoryHandle";

type OpenDirectoryMode =  'readwrite' | 'read';
type OpenDefaultDirectory = 'documents' | 'desktop' | 'downloads' | 'music' | 'pictures' | 'videos';

class DirectoryInfo {
  readonly path : string;
  readonly parentDirPath: string;
  readonly name : string;
  readonly depth : number;
  readonly children : FileWithDirectoryAndFileHandle[];

  constructor(path: string,parentDirPath:string, name: string, depth: number) {
    this.path = path;
    this.parentDirPath = parentDirPath;
    this.name = name;
    this.depth = depth;
    this.children = [];
  }
}

async function efaOpenDirectory(id:string = "", mode:OpenDirectoryMode = 'readwrite', defaultDirectory:OpenDefaultDirectory = 'documents'): Promise<DirectoryHandle> {
  const files = await directoryOpen({recursive: true,});

  //ディレクトリツリーの末端からオブジェクトを構築するため、パスの階層と、そのパスごとに存在するディレクトリパスを収集する
  const directories : string[] = [];
  const dirInfos: { [path: string]: DirectoryInfo } = {};

  for await (const file of files) {
    const filePath = file.webkitRelativePath.split('/');
    const depth = filePath.length - 1;
    const dirName = filePath[depth];
    const dirPath = filePath.slice(0, depth).join('/');
    const parentDirPath = depth > 0 ? filePath.slice(0, depth - 1).join('/') : '';


    if (dirInfos[dirPath] === undefined){
      dirInfos[dirPath] = new DirectoryInfo(dirPath,parentDirPath,dirName,depth);
      directories.push(dirPath);
    }
    dirInfos[dirPath].children.push(file);
  }

  //階層の浅い順にソート
  const dirSortedDepth = directories.sort((a,b) => dirInfos[a].depth - dirInfos[b].depth);
  const directoryHandles : { [path: string]: EfaDirectoryHandle } = {};
  for (let i = 0; i < dirSortedDepth.length; i++) {
    const dirInfo = dirInfos[dirSortedDepth[i]];

    if (dirInfo.parentDirPath === ''){
      directoryHandles[dirInfo.path] = new EfaDirectoryHandle(dirInfo.name,dirInfo.path,dirInfo.children);
      continue ;
    }

    const parentDirHandle = directoryHandles[dirInfo.parentDirPath];
    directoryHandles[dirInfo.path] = new EfaDirectoryHandle(dirInfo.name,dirInfo.path,dirInfo.children,parentDirHandle);
  }

  return directoryHandles[dirSortedDepth[0]];

}

export default efaOpenDirectory;
