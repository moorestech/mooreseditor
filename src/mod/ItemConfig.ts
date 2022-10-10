import {DefaultItemIconUrl, Item} from "./Item";
import {EfaFileHandle} from "../easyFileAccessor/EfaFIleHandle";
import {EfaDirectoryHandle} from "../easyFileAccessor/EfaDirectoryHandle";

export default class ItemConfig{
  get items() : Item[] {return this._items;}
  private _items : Item[];
  private readonly _metaFileHandle: EfaFileHandle;

  async changeItems(items : Item[]) {
    this._items = items;
    await this.save();
  }

  async save() {
    const json = [];
    for (const item of this.items) {
      const itemJson = {
        id: item.id,
        maxStacks: item.maxStacks
      }
      json.push(itemJson);
    }

    const writable = await this._metaFileHandle.createWritable();
    await writable.write(JSON.stringify(json,undefined,4));
    await writable.close();
  }

  public static async CreateItemConfig(configFile : EfaFileHandle,itemIconDir : EfaDirectoryHandle) : Promise<ItemConfig> {
    const file = await configFile.getFile();
    const text = await file.text();
    const json = JSON.parse(text);

    const items : Item[] = [];
    for (const itemJson of json) {
      const id = itemJson.id;
      const maxStacks = itemJson.maxStacks;

      let imageUrl = DefaultItemIconUrl;
      try {
        const iconArray = await (await (await itemIconDir.getFileHandle(id+".png")).getFile()).arrayBuffer();
        imageUrl = URL.createObjectURL(new Blob([iconArray],{type: "image/png"}));
      }catch (e) {
        //TODO アイテムアイコンの画像が無かったときの対処
      }

      const item = new Item(id,maxStacks,imageUrl);
      items.push(item);
    }

    return new ItemConfig(items,configFile);
  }

  private constructor(items : Item[],configFile : EfaFileHandle) {
    this._items = items;
    this._metaFileHandle = configFile;
  }
}
