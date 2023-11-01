import { EfaFileHandle } from '../../easyFileAccessor/EfaFIleHandle'
import { MachineRecipe, MachineRecipeInputItem, MachineRecipeOutputItem } from '../element/MachineRecipe'

export class MachineRecipeConfig {
  get MachineRecipes(): ReadonlyArray<MachineRecipe> {
    return this.machineRecipes
  }
  private machineRecipes: MachineRecipe[]
  private readonly craftConfigFileHandle: EfaFileHandle

  //TODO 配列を直接セットする方式はよくないと思うが、配列をStateに使ったりするので一旦これでやってる もっといいやり方あったら教えてください
  async changeRecipes(recipes: MachineRecipe[]) {
    this.machineRecipes = recipes
    await this.save()
  }

  async save() {
    //TODO
  }

  public static async CreateMachineRecipeConfig(configFile: EfaFileHandle): Promise<MachineRecipeConfig> {
    const file = await configFile.getFile()
    const text = await file.text()
    const json = JSON.parse(text)
    const machineRecipes: MachineRecipe[] = []

    //forループで全てのレシピを読み込む
    for (const recipe of json) {
      const inputItems: MachineRecipeInputItem[] = []
      for (const inputItem of recipe.input) {
        inputItems.push(new MachineRecipeInputItem(inputItem.itemName, inputItem.modId, inputItem.count))
      }
      const outputItems: MachineRecipeOutputItem[] = []
      for (const outputItem of recipe.output) {
        outputItems.push(
          new MachineRecipeOutputItem(outputItem.itemName, outputItem.modId, outputItem.count, outputItem.percent)
        )
      }
      const blockName = recipe.blockName
      const blockModId = recipe.blockModId
      const time = recipe.time

      machineRecipes.push(new MachineRecipe(inputItems, outputItems,blockModId,blockName, time))
    }

    return new MachineRecipeConfig(machineRecipes, configFile)
  }

  private constructor(recipes: MachineRecipe[], configFile: EfaFileHandle) {
    this.machineRecipes = recipes
    this.craftConfigFileHandle = configFile
  }
}
