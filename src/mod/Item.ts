export const DefaultItemIconUrl  = "/images/logos/iron ingot.png";

export class Item{
  private readonly _id: string;
  get id(): string {return this._id;}
  private readonly _maxStacks : number;
  get maxStacks(): number {return this._maxStacks;}
  private readonly _imageUrl : string;
  get imageUrl() : string {return this._imageUrl;}

  constructor(id: string, maxStacks: number,imageUrl : string) {
    this._id = id;
    this._maxStacks = maxStacks;
    this._imageUrl = imageUrl;
  }
}
