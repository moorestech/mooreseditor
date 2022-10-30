export class CraftRecipe {
  public get ResultItem(): CraftResultItem {
    return this._resultItem
  }
  private _resultItem: CraftResultItem
  public readonly Items: CraftRecipeItem[]

  constructor(resultItem: CraftResultItem, items: CraftRecipeItem[]) {
    this._resultItem = resultItem
    this.Items = items
  }

  /**
   * 結果のアイテムを差し替える
   * @param craftResultItem
   * @constructor
   */
  public SetResultItem(craftResultItem: CraftResultItem): void {
    this._resultItem = craftResultItem
  }

  Copy(): CraftRecipe {
    const items: CraftRecipeItem[] = []
    for (const item of this.Items) {
      items.push(item.Copy())
    }

    return new CraftRecipe(this.ResultItem.Copy(), items)
  }
}

export class CraftRecipeItem {
  public readonly ItemName: string | undefined
  public readonly ItemModId: string | undefined
  public readonly Count: number

  /**
   * クラフトレシピのアイテムを作成する
   * アイテムがないときはnullで表現する
   * unifiedを使わないのは、JSON.stringifyのときにundefinedは消えてしまうため
   * @param itemName
   * @param itemModId
   * @param count
   */
  constructor(itemName: string | undefined, itemModId: string | undefined, count: number) {
    this.ItemName = itemName
    this.ItemModId = itemModId
    this.Count = count
  }

  Copy() {
    return new CraftRecipeItem(this.ItemName, this.ItemModId, this.Count)
  }
}

export class CraftResultItem {
  public readonly ItemName: string | undefined
  public readonly ItemModId: string | undefined
  public readonly Count: number

  constructor(itemName: string | undefined, itemModId: string | undefined, count: number) {
    this.ItemName = itemName
    this.ItemModId = itemModId
    this.Count = count
  }

  Copy() {
    return new CraftResultItem(this.ItemName, this.ItemModId, this.Count)
  }
}
