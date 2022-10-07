
export class Item{
  private readonly _id: string;
  get id(): string {return this._id;}
  private readonly _maxStacks : number;
  get maxStacks(): number {return this._maxStacks;}

  constructor(id: string, maxStacks: number) {
    this._id = id;
    this._maxStacks = maxStacks;
  }
}
