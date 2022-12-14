import { EfaFileHandle } from '../../easyFileAccessor/EfaFIleHandle'

export default class ModMeta {
  private readonly _id: string
  private readonly _author: string
  private readonly _metaFileHandle: EfaFileHandle
  private _name: string
  private _version: string
  private _description: string

  get id(): string {
    return this._id
  }
  get author(): string {
    return this._author
  }
  get mergedId(): string {
    return this._author + ':' + this._id
  }
  get name(): string {
    return this._name
  }
  get version(): string {
    return this._version
  }
  get description(): string {
    return this._description
  }

  async changeName(name: string) {
    this._name = name
    await this.save()
  }
  async changeVersion(version: string) {
    this._version = version
    await this.save()
  }
  async changeDescription(description: string) {
    this._description = description
    await this.save()
  }
  async save() {
    const json = {
      id: this._id,
      name: this._name,
      version: this._version,
      author: this._author,
      description: this._description
    }
    const writable = await this._metaFileHandle.createWritable()
    await writable.write(JSON.stringify(json, undefined, 4))
    await writable.close()
  }

  static async CreateModMeta(metaFile: EfaFileHandle): Promise<ModMeta> {
    const file = await metaFile.getFile()
    const text = await file.text()
    const json = JSON.parse(text)

    const id = json.id
    if (id === undefined) {
      throw new Error('id is undefined in modMeta.json')
    }

    const name = json.name
    if (name === undefined) {
      throw new Error('name is undefined in modMeta.json')
    }

    const version = json.version
    if (version === undefined) {
      throw new Error('version is undefined in modMeta.json')
    }

    const author = json.author
    if (author === undefined) {
      throw new Error('author is undefined in modMeta.json')
    }

    const description = json.description
    if (description === undefined) {
      throw new Error('description is undefined in modMeta.json')
    }

    return new ModMeta(metaFile, id, name, version, author, description)
  }

  private constructor(
    metaFile: EfaFileHandle,
    id: string,
    name: string,
    version: string,
    author: string,
    description: string
  ) {
    this._id = id
    this._name = name
    this._version = version
    this._author = author
    this._description = description
    this._metaFileHandle = metaFile
  }
}
