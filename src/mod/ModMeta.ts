import {EfaFileHandle} from "../easyFileAccessor/EfaFIleHandle";

export default class ModMeta {
  private readonly _id: string;
  private readonly _author: string;
  private readonly _metaFileHandle : EfaFileHandle;

  private _name: string;
  private _version: string;
  private _description: string;


  get id(): string {return this._id;}
  get author(): string {return this._author;}

  get name(): string {return this._name;}
  get version(): string {return this._version;}
  get description(): string {return this._description;}

  async changeName(name: string) {
    await this.save();
    this._name = name;
  }

  async changeVersion(version: string) {
    await this.save();
    this._version = version;
  }

  async changeDescription(description: string) {
    await this.save();
    this._description = description;
  }


  async save() {
    const json = {
      id: this._id,
      name: this._name,
      version: this._version,
      author: this._author,
      description: this._description
    }

    const writable = await this._metaFileHandle.createWritable();
    await writable.write(JSON.stringify(json));
    await writable.close();
  }




  static async CreateModMeta(metaFile : EfaFileHandle) : Promise<ModMeta> {
    const file = await metaFile.getFile();
    const text = await file.text();
    const json = JSON.parse(text);

    return new ModMeta(metaFile,json.id,json.name,json.version,json.author,json.description);
  }

  private constructor(metaFile : EfaFileHandle, id: string, name: string, version: string, author: string, description: string) {
    this._id = id;
    this._name = name;
    this._version = version;
    this._author = author;
    this._description = description;
    this._metaFileHandle = metaFile;
  }

}
