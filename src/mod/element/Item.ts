export const DefaultItemIconUrl  = "/images/logos/iron ingot.png";
export const NoneItemIconUrl = "/images/none_icon.png";

export class Item{
  public readonly modId : string;
  public readonly name: string;
  public readonly maxStacks : number;
  public readonly imageUrl : string;
  public readonly imagePath : string;

  constructor(modId : string,name: string, maxStacks: number,imageUrl : string,imagePath : string) {
    this.modId = modId;
    this.name = name;
    this.maxStacks = maxStacks;
    this.imageUrl = imageUrl;
    this.imagePath = imagePath;
  }
}
