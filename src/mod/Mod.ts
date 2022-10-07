import ModMeta from "./ModMeta";
import {Observable, Subject} from "rxjs";

export default class Mod {
  get onModUpdate() : Observable<Mod> {
    return Mod.onModUpdateSubject;
  }
  static onModUpdateSubject : Subject<Mod> = new Subject<Mod>();




  private readonly _meta: ModMeta;

  get meta(): ModMeta {
    return this._meta;
  }

  constructor(meta: ModMeta) {
    this._meta = meta;
    Mod.onModUpdateSubject.next(this);
  }
}
