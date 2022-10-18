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
  public readonly ItemName : string | undefined;
  public readonly ItemModId : string | undefined;
  public readonly Count : number | undefined;

  constructor(itemName : string | undefined,itemModId : string | undefined,count : number | undefined) {
    this.ItemName = itemName;
    this.ItemModId = itemModId;
    this.Count = count;
  }
}

export class CraftResultItem{
  public readonly ItemName : string;
  public readonly ItemModId : string;
  public readonly Count : number;

  constructor(itemName : string,itemModId : string,count : number) {
    this.ItemName = itemName;
    this.ItemModId = itemModId;
    this.Count = count;
  }
}
