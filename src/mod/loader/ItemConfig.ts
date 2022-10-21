import {DefaultItemIconUrl, Item} from "../element/Item";
import {EfaFileHandle} from "../../easyFileAccessor/EfaFIleHandle";
import {EfaDirectoryHandle} from "../../easyFileAccessor/EfaDirectoryHandle";

export const DefaultImageDirectory = "assets/item";

export default class ItemConfig{
  get items() : ReadonlyArray<Item> {return this._items;}
  private _items : Item[];
  private readonly itemFileHandle: EfaFileHandle;
  private readonly modRootDirHandle : EfaDirectoryHandle;

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

  public async updateItemImage(item : Item) : Promise<Item>{
    //ファイルを開くウィンドウを出す
    const fileHandle = await window.showOpenFilePicker({types: [
      {
        description: 'Item Icon Image',
        accept: {'image/png': ['.png'],},
      }]})

    //ファイルを読み込む
    const file = await fileHandle[0].getFile();
    const arrayBuffer = await file.arrayBuffer();
    const imageBlob = new Blob([arrayBuffer],{type: "image/png"});
    const imageUrl = URL.createObjectURL(imageBlob);


    //blobを保存する
    const fileName = item.name + ".png";
    const imageFile = await (await this.modRootDirHandle.getDirectoryHandle(DefaultImageDirectory)).getOrCreateFile(fileName);
    const writable = await imageFile.createWritable();
    await writable.write(imageBlob);
    await writable.close();
    const imageFilePath = DefaultImageDirectory + "/" + fileName;

    return new Item(item.modId,item.name, item.maxStacks, imageUrl, imageFilePath);
  }




  public static async CreateItemConfig(configFile : EfaFileHandle,modRootDir : EfaDirectoryHandle,modId : string) : Promise<ItemConfig> {
    const file = await configFile.getFile();
    const text = await file.text();
    const json = JSON.parse(text);
    const items : Item[] = [];

    for (const itemJson of json) {
      const name = itemJson.name;
      const maxStacks = itemJson.maxStacks;
      const imagePath : string = itemJson.imagePath;
      let imageUrl = DefaultItemIconUrl;
      try {
        const iconArray = await (await (await modRootDir.getFileHandle(imagePath)).getFile()).arrayBuffer();
        imageUrl = URL.createObjectURL(new Blob([iconArray],{type: "image/png"}));
      }catch (e) {
        //TODO アイテムアイコンの画像が無かったときの対処
      }

      const item = new Item(modId,name,maxStacks,imageUrl,imagePath);
      items.push(item);
    }

    return new ItemConfig(items,configFile,modRootDir);
  }

  private constructor(items : Item[],configFile : EfaFileHandle,modRootDir : EfaDirectoryHandle) {
    this._items = items;
    this.itemFileHandle = configFile;
    this.modRootDirHandle = modRootDir;
  }
}
