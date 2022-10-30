import { Transform } from './Transform'

export class Block {
  public readonly name: string
  public readonly type: string
  public readonly itemModId: string
  public readonly itemName: string

  public readonly modelTransform: Transform
  public readonly param: any

  constructor(name: string, type: string, itemModId: string, itemName: string, modelTransform: Transform, param: any) {
    this.name = name
    this.type = type
    this.itemModId = itemModId
    this.itemName = itemName
    this.modelTransform = modelTransform
    this.param = param
  }
}
