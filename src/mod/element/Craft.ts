import {Item} from "./Item";

export class Craft {
  public readonly ResultItem : Item;
  public readonly Items : Item[];

  constructor(resultItem : Item, items : Item[]) {
    this.ResultItem = resultItem;
    this.Items = items;
  }
}
