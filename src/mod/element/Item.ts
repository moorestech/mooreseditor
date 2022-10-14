export const DefaultItemIconUrl  = "/images/logos/iron ingot.png";

export class Item{
  public readonly name: string;
  public readonly maxStacks : number;
  public readonly imageUrl : string;
  public readonly imagePath : string;

  constructor(name: string, maxStacks: number,imageUrl : string,imagePath : string) {
    this.name = name;
    this.maxStacks = maxStacks;
    this.imageUrl = imageUrl;
    this.imagePath = imagePath;
  }
}
