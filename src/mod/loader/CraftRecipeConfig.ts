import {Item} from "../element/Item";
import {EfaFileHandle} from "../../easyFileAccessor/EfaFIleHandle";
import {CraftRecipe, CraftRecipeItem, CraftResultItem} from "../element/CraftRecipe";

export class CraftRecipeConfig {

  get recipes() : ReadonlyArray<CraftRecipe> {return this.craftRecipes;}
  private craftRecipes : CraftRecipe[];
  private readonly craftConfigFileHandle: EfaFileHandle;

  async changeRecipes(recipes : CraftRecipe[]) {
    this.craftRecipes = recipes;
    await this.save();
  }

  async save() {
    const json = [];
    for (const craftRecipe of this.craftRecipes) {
      const itemJson = {
        items: craftRecipe.Items,
        result: craftRecipe.ResultItem,
      }
      json.push(itemJson);
    }

    const writable = await this.craftConfigFileHandle.createWritable();
    await writable.write(JSON.stringify(json,undefined,4));
    await writable.close();
  }





  public static async CreateCraftRecipeConfig(configFile : EfaFileHandle,items : ReadonlyArray<Item>) : Promise<CraftRecipeConfig> {
    const file = await configFile.getFile();
    const text = await file.text();
    const json = JSON.parse(text);
    const craftRecipes : CraftRecipe[] = [];

    //forループで全てのレシピを読み込む
    for (const recipe of json) {
      //結果アイテムの読み込み
      const resultItem = CraftRecipeConfig.searchItem(items,recipe.result.itemName,recipe.result.modId);
      const resultCount = recipe.result.count;
      const craftResultItem = new CraftResultItem(resultItem,resultCount);

      //レシピの読み込み
      const craftRecipeItems : CraftRecipeItem[] = [];
      for (const itemJson of recipe.items) {
        const itemName = itemJson.itemName;
        const itemModId = itemJson.modId;
        if (itemName === undefined || itemModId === undefined) {
          craftRecipeItems.push(new CraftRecipeItem(undefined,undefined));
        }

        const item = CraftRecipeConfig.searchItem(items,itemName,itemModId);
        const count = itemJson.count;

        craftRecipeItems.push(new CraftRecipeItem(item,count));
      }

      craftRecipes.push(new CraftRecipe(craftResultItem,craftRecipeItems));
    }


    return new CraftRecipeConfig(craftRecipes,configFile);
  }


  //TODO 複数modロードに対応したらmodIdを考慮する
  private static searchItem(items : ReadonlyArray<Item>,name : string,modId : string) : Item {
    for (const item of items) {
      if (item.name === name) {
        return item;
      }
    }

    throw new Error("Item not found");
  }

  private constructor(recipes : CraftRecipe[],configFile : EfaFileHandle) {
    this.craftRecipes = recipes;
    this.craftConfigFileHandle = configFile;
  }
}
