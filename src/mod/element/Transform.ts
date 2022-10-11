import {Vector3} from "./Vector3";

export class Transform {
  public readonly position: Vector3;
  public readonly rotation: Vector3;
  public readonly scale: Vector3;

  constructor(position: Vector3, rotation: Vector3, scale: Vector3) {
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
  }
}
