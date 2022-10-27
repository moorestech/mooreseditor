export class MachineRecipe {
  public readonly BlockId : number;
  public readonly Time : number;
  public readonly InputItems : MachineRecipeInputItem[];
  public readonly OutputItems : MachineRecipeOutputItem[];

  constructor(inputItems : MachineRecipeInputItem[],outputItems : MachineRecipeOutputItem[],blockId : number,time : number) {
    this.InputItems = inputItems;
    this.OutputItems = outputItems;
    this.BlockId = blockId;
    this.Time = time;
  }
}

export class MachineRecipeInputItem{
  public readonly ItemName : string | undefined;
  public readonly ItemModId : string | undefined;
  public readonly Count : number;

  constructor(itemName : string | undefined,itemModId : string | undefined,count : number) {
    this.ItemName = itemName;
    this.ItemModId = itemModId;
    this.Count = count;
  }
}
export class MachineRecipeOutputItem{
  public readonly ItemName : string | undefined;
  public readonly ItemModId : string | undefined;
  public readonly Count : number;
  public readonly Percent : number;

  constructor(itemName : string | undefined,itemModId : string | undefined,count : number,percent : number) {
    this.ItemName = itemName;
    this.ItemModId = itemModId;
    this.Count = count;
    this.Percent = percent;
  }
}
