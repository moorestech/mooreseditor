export const DefaultItemIconUrl  = "/images/logos/iron ingot.png";

export class Item{
  public readonly id: string;
  public readonly maxStacks : number;
  public readonly imageUrl : string;

  constructor(id: string, maxStacks: number,imageUrl : string) {
    this.id = id;
    this.maxStacks = maxStacks;
    this.imageUrl = imageUrl;
  }
}
