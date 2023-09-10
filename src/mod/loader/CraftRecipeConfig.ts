import { Item } from '../element/Item'
import { EfaFileHandle } from '../../easyFileAccessor/EfaFIleHandle'
import { CraftRecipe, CraftRecipeItem, CraftResultItem } from '../element/CraftRecipe'
import { ItemConfigUtil } from '../util/ItemConfigUtil'

export class CraftRecipeConfig {
  get CraftRecipes(): ReadonlyArray<CraftRecipe> {
    return this._craftRecipes
  }
  private _craftRecipes: CraftRecipe[]
  private readonly craftConfigFileHandle: EfaFileHandle

  //TODO 配列を直接セットする方式はよくないと思うが、配列をStateに使ったりするので一旦これでやってる もっといいやり方あったら教えてください
  async changeRecipes(recipes: CraftRecipe[]) {
    this._craftRecipes = recipes
    await this.save()
  }

  async save() {
    const json = []
    for (const craftRecipe of this._craftRecipes) {
      const items = []
      for (const item of craftRecipe.Items) {
        items.push({ itemName: item.ItemName ?? null, modId: item.ItemModId ?? null, count: item.Count })
      }
      const result = {
        itemName: craftRecipe.ResultItem.ItemName,
        modId: craftRecipe.ResultItem.ItemModId,
        count: craftRecipe.ResultItem.Count
      }

      const itemJson = {
        items: items,
        result: result
      }
      json.push(itemJson)
    }

    console.log(json)

    const writable = await this.craftConfigFileHandle.createWritable()
    await writable.write(JSON.stringify(json, undefined, 4))
    await writable.close()
  }

  public static async CreateCraftRecipeConfig(
    configFile: EfaFileHandle,
    items: ReadonlyArray<Item>
  ): Promise<CraftRecipeConfig> {
    const file = await configFile.getFile()
    const text = await file.text()
    const json = JSON.parse(text)
    const craftRecipes: CraftRecipe[] = []

    //forループで全てのレシピを読み込む
    let i = 0;
    for (const recipe of json) {
      i++;

      //結果アイテムの読み込み
      const resultItem = ItemConfigUtil.GetItem(recipe.result.itemName, recipe.result.modId, items)
      if (resultItem === undefined) {
        throw new Error("レシピの結果アイテムがありませんでした。 index: " + i + ' : ' + recipe.result.modId + ' is not found')
      }
      const craftResultItem = new CraftResultItem(recipe.result.itemName, recipe.result.modId, recipe.result.count)

      //レシピの読み込み
      const craftRecipeItems: CraftRecipeItem[] = []
      for (const itemJson of recipe.items) {
        const itemName = itemJson.itemName
        const itemModId = itemJson.modId
        if (itemName === null || itemModId === null) {
          craftRecipeItems.push(new CraftRecipeItem(undefined, undefined, 0))
          continue
        }

        const item = ItemConfigUtil.GetItem(itemName, itemModId, items)
        if (item === undefined) {
          throw new Error(itemName + ' : ' + itemModId + ' is not found')
        }

        const count = itemJson.count
        craftRecipeItems.push(new CraftRecipeItem(itemName, itemModId, count))
      }

      craftRecipes.push(new CraftRecipe(craftResultItem, craftRecipeItems))
    }

    return new CraftRecipeConfig(craftRecipes, configFile)
  }

  private constructor(recipes: CraftRecipe[], configFile: EfaFileHandle) {
    this._craftRecipes = recipes
    this.craftConfigFileHandle = configFile
  }
}
