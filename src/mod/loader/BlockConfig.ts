import { Block } from '../element/Block'
import { EfaFileHandle } from '../../easyFileAccessor/EfaFIleHandle'
import { Transform } from '../element/Transform'
import { Vector3 } from '../element/Vector3'

export const DefaultBlockType: ReadonlyArray<string> = [
  'Block',
  'Machine',
  'BeltConveyor',
  'Miner',
  'Generator',
  'ElectricPole',
  'Chest',
  'GearMachine',
  'GearMiner',
  'GearGenerator',
  'GearEnergyTransformer',
]

export class BlockConfig {
  get blocks(): ReadonlyArray<Block> {
    return this._blocks
  }
  private _blocks: Block[]
  private readonly blockFileHandle: EfaFileHandle

  //TODO 配列を直接セットする方式はよくないと思うが、配列をStateに使ったりするので一旦これでやってる もっといいやり方あったら教えてください
  async changeBlocks(blocks: Block[]) {
    this._blocks = blocks
    await this.save()
  }

  async save() {
    const blocks = []
    for (const block of this._blocks) {
      const blockJson = {
        name: block.name,
        type: block.type,
        itemModId: block.itemModId,
        itemName: block.itemName,
        param: block.param,
        modelTransform: block.modelTransform
      }
      blocks.push(blockJson)
    }
    const json = {
      Blocks: blocks
    }

    const writable = await this.blockFileHandle.createWritable()
    await writable.write(JSON.stringify(json, undefined, 4))
    await writable.close()
  }

  public GetBlock(blockName: string,blockModId: string): Block | undefined {
    return this._blocks.find((block) => block.name === blockName && block.itemModId === blockModId)
  }

  public static async CreateBlockConfig(configFile: EfaFileHandle): Promise<BlockConfig> {
    const file = await configFile.getFile()
    const text = await file.text()
    const json = JSON.parse(text)
    const blocks: Block[] = []

    for (const blockJson of json.Blocks) {
      const name = blockJson.name
      const type = blockJson.type
      const itemModId = blockJson.itemModId
      const itemName = blockJson.itemName
      const param = blockJson.param

      let modelTransform = new Transform(Vector3.zero, Vector3.zero, Vector3.one)
      if (blockJson.modelTransform !== undefined) {
        const pos = blockJson.modelTransform.position
        const rot = blockJson.modelTransform.rotation
        const scale = blockJson.modelTransform.scale

        const posVec = new Vector3(pos.x ?? 0, pos.y ?? 0, pos.z ?? 0)
        const rotVec = new Vector3(rot.x ?? 0, rot.y ?? 0, rot.z ?? 0)
        const scaleVec = new Vector3(scale.x ?? 1, scale.y ?? 1, scale.z ?? 1)
        modelTransform = new Transform(posVec, rotVec, scaleVec)
      }

      const block = new Block(name, type, itemModId, itemName, modelTransform, param)

      blocks.push(block)
    }

    return new BlockConfig(blocks, configFile)
  }

  private constructor(blocks: Block[], configFile: EfaFileHandle) {
    this._blocks = blocks
    this.blockFileHandle = configFile
  }
}
