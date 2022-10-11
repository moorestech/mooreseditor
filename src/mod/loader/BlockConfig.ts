import {Block} from "../element/Block";
import {EfaFileHandle} from "../../easyFileAccessor/EfaFIleHandle";
import {Transform} from "../element/Transform";
import {Vector3} from "../element/Vector3";

export class BlockConfig {
  get blocks() : ReadonlyArray<Block> {return this._blocks;}
  private _blocks : Block[];
  private readonly blockFileHandle: EfaFileHandle;

  async changeItems(blocks : Block[]) {
    this._blocks = blocks;
    await this.save();
  }

  async save() {
    const blocks = [];
    for (const block of this._blocks) {
      const blockJson = {
        name: block.name,
        type: block.type,
        itemModId: block.itemModId,
        itemName: block.itemName,
        param: block.param,
        modelTransform: block.modelTransform,
      }
      blocks.push(blockJson);
    }
    const json = {
      Blocks: blocks
    }

    const writable = await this.blockFileHandle.createWritable();
    await writable.write(JSON.stringify(json,undefined,4));
    await writable.close();
  }


  public static async CreateBlockConfig(configFile : EfaFileHandle) : Promise<BlockConfig> {
    const file = await configFile.getFile();
    const text = await file.text();
    const json = JSON.parse(text);
    const blocks : Block[] = [];

    for (const blockJson of json) {
      const name = blockJson.name;
      const type = blockJson.type;
      const itemModId = blockJson.itemModId;
      const itemName = blockJson.itemName;
      const param = blockJson.param;
      const pos:number[] = blockJson.modelTransform.pos;
      const rot:number[] = blockJson.modelTransform.rot;
      const scale:number[] = blockJson.modelTransform.scale;

      const posVec = new Vector3(pos[0],pos[1],pos[2]);
      const rotVec = new Vector3(rot[0],rot[1],rot[2]);
      const scaleVec = new Vector3(scale[0],scale[1],scale[2]);
      const modelTransform = new Transform(posVec,rotVec,scaleVec);
      const block = new Block(name,type,itemModId,itemName,modelTransform,param);

      blocks.push(block);
    }

    return new BlockConfig(blocks,configFile);
  }

  private constructor(blocks : Block[],configFile : EfaFileHandle) {
    this._blocks = blocks;
    this.blockFileHandle = configFile;
  }

}
