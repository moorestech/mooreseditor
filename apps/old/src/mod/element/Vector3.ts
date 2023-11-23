export class Vector3 {
  public readonly x: number
  public readonly y: number
  public readonly z: number

  constructor(x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
  }

  public static readonly zero = new Vector3(0, 0, 0)
  public static readonly one = new Vector3(1, 1, 1)
}
