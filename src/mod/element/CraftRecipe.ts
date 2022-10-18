import {Item} from "./Item";

export class CraftRecipe {
  public readonly ResultItem : CraftResultItem;
  public readonly Items : CraftRecipeItem[];

  constructor(resultItem : CraftResultItem, items : CraftRecipeItem[]) {
    this.ResultItem = resultItem;
    this.Items = items;
  }
}

export class CraftRecipeItem{
  public readonly Item : Item | undefined;
  public readonly Count : number | undefined;

  constructor(item : Item | undefined,count : number | undefined) {
    this.Item = item;
    this.Count = count;
  }
}

export class CraftResultItem{
  public readonly Item : Item;
  public readonly Count : number;

  constructor(item : Item,count : number) {
    this.Item = item;
    this.Count = count;
  }
}
