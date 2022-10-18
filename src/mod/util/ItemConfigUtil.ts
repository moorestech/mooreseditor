import {Item} from "../element/Item";

export class ItemConfigUtil {

  public static GetItem(itemName: string, modId: string, items: ReadonlyArray<Item>): Item | undefined {
    for (const item of items) {
      //TODO 複数modロードに対応したらmodIdを考慮する
      if (item.name === itemName) {
        return item;
      }
    }

    return undefined;
  }
}
