import {Item} from "./Item";
import {EfaFileHandle} from "../easyFileAccessor/EfaFIleHandle";

export default class ItemConfig{
  private readonly items: Item[] = [];
  private readonly _metaFileHandle: EfaFileHandle;

  getItemCount() : number {return this.items.length;}
  getItem(index: number) : Item {return this.items[index];}
  addItem(item: Item) : void {this.items.push(item);}
  removeItem(index: number) {this.items.splice(index,1);}
  setItem(index: number, item: Item) {this.items[index] = item;}

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

  public static async CreateItemConfig(configFile : EfaFileHandle) : Promise<ItemConfig> {
    const file = await configFile.getFile();
    const text = await file.text();
    const json = JSON.parse(text);

    const items : Item[] = [];
    for (const itemJson of json) {
      const id = itemJson.id;
      const maxStacks = itemJson.maxStacks;

      const item = new Item(id,maxStacks);
      items.push(item);
    }

    return new ItemConfig(items,configFile);
  }

  private constructor(items : Item[],configFile : EfaFileHandle) {
    this.items = items;
    this._metaFileHandle = configFile;
  }
}
