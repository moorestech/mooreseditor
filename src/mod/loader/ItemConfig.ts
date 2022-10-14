import {DefaultItemIconUrl, Item} from "../element/Item";
import {EfaFileHandle} from "../../easyFileAccessor/EfaFIleHandle";
import {EfaDirectoryHandle} from "../../easyFileAccessor/EfaDirectoryHandle";

export default class ItemConfig{
  get items() : ReadonlyArray<Item> {return this._items;}
  private _items : Item[];
  private readonly itemFileHandle: EfaFileHandle;

  async changeItems(items : Item[]) {
    this._items = items;
    await this.save();
  }

  async save() {
    const json = [];
    for (const item of this.items) {
      const itemJson = {
        name: item.name,
        maxStacks: item.maxStacks,
        imagePath : item.imagePath
      }
      json.push(itemJson);
    }

    const writable = await this.itemFileHandle.createWritable();
    await writable.write(JSON.stringify(json,undefined,4));
    await writable.close();
  }




  public static async CreateItemConfig(configFile : EfaFileHandle,itemIconDir : EfaDirectoryHandle) : Promise<ItemConfig> {
    const file = await configFile.getFile();
    const text = await file.text();
    const json = JSON.parse(text);
    const items : Item[] = [];

    for (const itemJson of json) {
      const name = itemJson.name;
      const maxStacks = itemJson.maxStacks;
      const imagePath = itemJson.imagePath;
      let imageUrl = DefaultItemIconUrl;
      try {
        const iconArray = await (await (await itemIconDir.getFileHandle(name+".png")).getFile()).arrayBuffer();
        imageUrl = URL.createObjectURL(new Blob([iconArray],{type: "image/png"}));
      }catch (e) {
        //TODO アイテムアイコンの画像が無かったときの対処
      }

      const item = new Item(name,maxStacks,imageUrl,imagePath);
      items.push(item);
    }

    return new ItemConfig(items,configFile);
  }

  private constructor(items : Item[],configFile : EfaFileHandle) {
    this._items = items;
    this.itemFileHandle = configFile;
  }
}
