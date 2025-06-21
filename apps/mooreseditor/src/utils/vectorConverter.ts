export type Vector2Object = { x: number; y: number };
export type Vector3Object = { x: number; y: number; z: number };
export type Vector4Object = { x: number; y: number; z: number; w: number };

export type Vector2Array = [number, number];
export type Vector3Array = [number, number, number];
export type Vector4Array = [number, number, number, number];

export function arrayToVector2(arr: Vector2Array | null | undefined): Vector2Object {
  if (!arr || !Array.isArray(arr)) {
    return { x: 0, y: 0 };
  }
  return { x: arr[0] ?? 0, y: arr[1] ?? 0 };
}

export function vector2ToArray(obj: Vector2Object | null | undefined): Vector2Array {
  if (!obj) {
    return [0, 0];
  }
  return [obj.x ?? 0, obj.y ?? 0];
}

export function arrayToVector3(arr: Vector3Array | null | undefined): Vector3Object {
  if (!arr || !Array.isArray(arr)) {
    return { x: 0, y: 0, z: 0 };
  }
  return { x: arr[0] ?? 0, y: arr[1] ?? 0, z: arr[2] ?? 0 };
}

export function vector3ToArray(obj: Vector3Object | null | undefined): Vector3Array {
  if (!obj) {
    return [0, 0, 0];
  }
  return [obj.x ?? 0, obj.y ?? 0, obj.z ?? 0];
}

export function arrayToVector4(arr: Vector4Array | null | undefined): Vector4Object {
  if (!arr || !Array.isArray(arr)) {
    return { x: 0, y: 0, z: 0, w: 0 };
  }
  return { x: arr[0] ?? 0, y: arr[1] ?? 0, z: arr[2] ?? 0, w: arr[3] ?? 0 };
}

export function vector4ToArray(obj: Vector4Object | null | undefined): Vector4Array {
  if (!obj) {
    return [0, 0, 0, 0];
  }
  return [obj.x ?? 0, obj.y ?? 0, obj.z ?? 0, obj.w ?? 0];
}

export function isVectorArray(value: any): boolean {
  return Array.isArray(value) && 
    value.length >= 2 && 
    value.length <= 4 &&
    value.every((v: any) => typeof v === 'number');
}

export function isVectorObject(value: any): boolean {
  return value && 
    typeof value === 'object' && 
    !Array.isArray(value) &&
    'x' in value && 
    typeof value.x === 'number';
}