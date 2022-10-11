import ModMeta from "./ModMeta";
import {Observable, Subject} from "rxjs";
import ItemConfig from "./ItemConfig";
import {BlockConfig} from "./BlockConfig";

export default class Mod {
  static get onModUpdate() : Observable<Mod> {return Mod.onModUpdateSubject;}
  private static onModUpdateSubject : Subject<Mod> = new Subject<Mod>();

  static get instance() : Mod {return Mod._instance;}
  private static _instance : Mod;




  private readonly _meta: ModMeta;
  get meta(): ModMeta {return this._meta;}

  private readonly _itemConfig : ItemConfig;
  get itemConfig() : ItemConfig {return this._itemConfig;}

  private readonly _blockConfig : BlockConfig;
  get blockConfig() : BlockConfig {return this._blockConfig;}

  constructor(meta: ModMeta,itemConfig : ItemConfig,blockConfig : BlockConfig) {
    this._meta = meta;
    this._itemConfig = itemConfig;
    this._blockConfig = blockConfig;
    Mod._instance = this;
    Mod.onModUpdateSubject.next(this);
  }
}
