import ModMeta from "./ModMeta";

export default class Mod {
  private readonly _meta: ModMeta;


  get meta(): ModMeta {
    return this._meta;
  }

  constructor(meta: ModMeta) {
    this._meta = meta;
  }
}
