import { EfaDirectoryHandle } from './EfaDirectoryHandle'
import { EfaHandle, FileSystemKind } from './EfaHandle'

export class EfaFileHandle implements EfaHandle {
  readonly kind: FileSystemKind
  readonly name: string
  readonly path: string
  readonly parentDirectory: EfaDirectoryHandle

  private readonly fileHandle: FileSystemFileHandle

  constructor(path: string, parentDirectory: EfaDirectoryHandle, fileHandle: FileSystemFileHandle) {
    this.kind = 'file'
    this.name = fileHandle.name
    this.path = path
    this.parentDirectory = parentDirectory
    this.fileHandle = fileHandle
  }

  async getFile(): Promise<File> {
    return await this.fileHandle.getFile()
  }
  async createWritable(): Promise<FileSystemWritableFileStream> {
    return await this.fileHandle.createWritable()
  }
}
