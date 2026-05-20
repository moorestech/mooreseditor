// AI Generated Test Code
import { describe, it, expect } from "vitest";

import {
  arrayToVector2,
  vector2ToArray,
  arrayToVector3,
  vector3ToArray,
  arrayToVector4,
  vector4ToArray,
  isVectorArray,
  isVectorObject,
  type Vector2Array,
  type Vector3Array,
  type Vector4Array,
} from "./vectorConverter";

describe("vectorConverter", () => {
  describe("arrayToVector2", () => {
    it("should convert valid array to Vector2Object", () => {
      expect(arrayToVector2([1, 2])).toEqual({ x: 1, y: 2 });
      expect(arrayToVector2([0, 0])).toEqual({ x: 0, y: 0 });
      expect(arrayToVector2([-1.5, 3.14])).toEqual({ x: -1.5, y: 3.14 });
    });

    it("should handle null and undefined", () => {
      expect(arrayToVector2(null)).toEqual({ x: 0, y: 0 });
      expect(arrayToVector2(undefined)).toEqual({ x: 0, y: 0 });
    });

    it("should handle arrays with missing values", () => {
      expect(arrayToVector2([1] as any)).toEqual({ x: 1, y: 0 });
      expect(arrayToVector2([] as any)).toEqual({ x: 0, y: 0 });
    });

    it("should handle arrays with null/undefined values", () => {
      expect(arrayToVector2([null, 2] as any)).toEqual({ x: 0, y: 2 });
      expect(arrayToVector2([1, undefined] as any)).toEqual({ x: 1, y: 0 });
    });
  });

  describe("vector2ToArray", () => {
    it("should convert Vector2Object to array", () => {
      expect(vector2ToArray({ x: 1, y: 2 })).toEqual([1, 2]);
      expect(vector2ToArray({ x: 0, y: 0 })).toEqual([0, 0]);
      expect(vector2ToArray({ x: -1.5, y: 3.14 })).toEqual([-1.5, 3.14]);
    });

    it("should handle null and undefined", () => {
      expect(vector2ToArray(null)).toEqual([0, 0]);
      expect(vector2ToArray(undefined)).toEqual([0, 0]);
    });

    it("should handle objects with missing properties", () => {
      expect(vector2ToArray({ x: 1 } as any)).toEqual([1, 0]);
      expect(vector2ToArray({ y: 2 } as any)).toEqual([0, 2]);
      expect(vector2ToArray({} as any)).toEqual([0, 0]);
    });

    it("should handle objects with null/undefined values", () => {
      expect(vector2ToArray({ x: null, y: 2 } as any)).toEqual([0, 2]);
      expect(vector2ToArray({ x: 1, y: undefined } as any)).toEqual([1, 0]);
    });
  });

  describe("arrayToVector3", () => {
    it("should convert valid array to Vector3Object", () => {
      expect(arrayToVector3([1, 2, 3])).toEqual({ x: 1, y: 2, z: 3 });
      expect(arrayToVector3([0, 0, 0])).toEqual({ x: 0, y: 0, z: 0 });
      expect(arrayToVector3([-1.5, 3.14, 2.71])).toEqual({
        x: -1.5,
        y: 3.14,
        z: 2.71,
      });
    });

    it("should handle null and undefined", () => {
      expect(arrayToVector3(null)).toEqual({ x: 0, y: 0, z: 0 });
      expect(arrayToVector3(undefined)).toEqual({ x: 0, y: 0, z: 0 });
    });

    it("should handle arrays with missing values", () => {
      expect(arrayToVector3([1, 2] as any)).toEqual({ x: 1, y: 2, z: 0 });
      expect(arrayToVector3([1] as any)).toEqual({ x: 1, y: 0, z: 0 });
      expect(arrayToVector3([] as any)).toEqual({ x: 0, y: 0, z: 0 });
    });
  });

  describe("vector3ToArray", () => {
    it("should convert Vector3Object to array", () => {
      expect(vector3ToArray({ x: 1, y: 2, z: 3 })).toEqual([1, 2, 3]);
      expect(vector3ToArray({ x: 0, y: 0, z: 0 })).toEqual([0, 0, 0]);
      expect(vector3ToArray({ x: -1.5, y: 3.14, z: 2.71 })).toEqual([
        -1.5, 3.14, 2.71,
      ]);
    });

    it("should handle null and undefined", () => {
      expect(vector3ToArray(null)).toEqual([0, 0, 0]);
      expect(vector3ToArray(undefined)).toEqual([0, 0, 0]);
    });

    it("should handle objects with missing properties", () => {
      expect(vector3ToArray({ x: 1, y: 2 } as any)).toEqual([1, 2, 0]);
      expect(vector3ToArray({ x: 1 } as any)).toEqual([1, 0, 0]);
      expect(vector3ToArray({} as any)).toEqual([0, 0, 0]);
    });
  });

  describe("arrayToVector4", () => {
    it("should convert valid array to Vector4Object", () => {
      expect(arrayToVector4([1, 2, 3, 4])).toEqual({ x: 1, y: 2, z: 3, w: 4 });
      expect(arrayToVector4([0, 0, 0, 0])).toEqual({ x: 0, y: 0, z: 0, w: 0 });
      expect(arrayToVector4([-1.5, 3.14, 2.71, 1.41])).toEqual({
        x: -1.5,
        y: 3.14,
        z: 2.71,
        w: 1.41,
      });
    });

    it("should handle null and undefined", () => {
      expect(arrayToVector4(null)).toEqual({ x: 0, y: 0, z: 0, w: 0 });
      expect(arrayToVector4(undefined)).toEqual({ x: 0, y: 0, z: 0, w: 0 });
    });

    it("should handle arrays with missing values", () => {
      expect(arrayToVector4([1, 2, 3] as any)).toEqual({
        x: 1,
        y: 2,
        z: 3,
        w: 0,
      });
      expect(arrayToVector4([1, 2] as any)).toEqual({ x: 1, y: 2, z: 0, w: 0 });
      expect(arrayToVector4([1] as any)).toEqual({ x: 1, y: 0, z: 0, w: 0 });
      expect(arrayToVector4([] as any)).toEqual({ x: 0, y: 0, z: 0, w: 0 });
    });
  });

  describe("vector4ToArray", () => {
    it("should convert Vector4Object to array", () => {
      expect(vector4ToArray({ x: 1, y: 2, z: 3, w: 4 })).toEqual([1, 2, 3, 4]);
      expect(vector4ToArray({ x: 0, y: 0, z: 0, w: 0 })).toEqual([0, 0, 0, 0]);
      expect(vector4ToArray({ x: -1.5, y: 3.14, z: 2.71, w: 1.41 })).toEqual([
        -1.5, 3.14, 2.71, 1.41,
      ]);
    });

    it("should handle null and undefined", () => {
      expect(vector4ToArray(null)).toEqual([0, 0, 0, 0]);
      expect(vector4ToArray(undefined)).toEqual([0, 0, 0, 0]);
    });

    it("should handle objects with missing properties", () => {
      expect(vector4ToArray({ x: 1, y: 2, z: 3 } as any)).toEqual([1, 2, 3, 0]);
      expect(vector4ToArray({ x: 1, y: 2 } as any)).toEqual([1, 2, 0, 0]);
      expect(vector4ToArray({ x: 1 } as any)).toEqual([1, 0, 0, 0]);
      expect(vector4ToArray({} as any)).toEqual([0, 0, 0, 0]);
    });
  });

  describe("isVectorArray", () => {
    it("should return true for valid vector arrays", () => {
      expect(isVectorArray([1, 2])).toBe(true);
      expect(isVectorArray([1, 2, 3])).toBe(true);
      expect(isVectorArray([1, 2, 3, 4])).toBe(true);
      expect(isVectorArray([0, 0])).toBe(true);
      expect(isVectorArray([-1.5, 3.14])).toBe(true);
    });

    it("should return false for invalid vector arrays", () => {
      expect(isVectorArray([])).toBe(false);
      expect(isVectorArray([1])).toBe(false);
      expect(isVectorArray([1, 2, 3, 4, 5])).toBe(false);
      expect(isVectorArray([1, "2"])).toBe(false);
      expect(isVectorArray(["1", "2"])).toBe(false);
      expect(isVectorArray([1, null])).toBe(false);
      expect(isVectorArray([1, undefined])).toBe(false);
      expect(isVectorArray(null)).toBe(false);
      expect(isVectorArray(undefined)).toBe(false);
      expect(isVectorArray({})).toBe(false);
      expect(isVectorArray("vector")).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(isVectorArray([NaN, NaN])).toBe(true); // typeof NaN === 'number'
      expect(isVectorArray([Infinity, -Infinity])).toBe(true);
      expect(isVectorArray([0, -0])).toBe(true);
    });
  });

  describe("isVectorObject", () => {
    it("should return true for valid vector objects", () => {
      expect(isVectorObject({ x: 1 })).toBe(true);
      expect(isVectorObject({ x: 1, y: 2 })).toBe(true);
      expect(isVectorObject({ x: 1, y: 2, z: 3 })).toBe(true);
      expect(isVectorObject({ x: 1, y: 2, z: 3, w: 4 })).toBe(true);
      expect(isVectorObject({ x: 0 })).toBe(true);
      expect(isVectorObject({ x: -1.5, y: 3.14 })).toBe(true);
    });

    it("should return false for invalid vector objects", () => {
      expect(isVectorObject({})).toBe(false);
      expect(isVectorObject({ y: 1 })).toBe(false);
      expect(isVectorObject({ z: 1 })).toBe(false);
      expect(isVectorObject({ w: 1 })).toBe(false);
      expect(isVectorObject({ x: "1" })).toBe(false);
      expect(isVectorObject({ x: null })).toBe(false);
      expect(isVectorObject({ x: undefined })).toBe(false);
      expect(isVectorObject(null)).toBe(false);
      expect(isVectorObject(undefined)).toBe(false);
      expect(isVectorObject([])).toBe(false);
      expect(isVectorObject([1, 2])).toBe(false);
      expect(isVectorObject("vector")).toBe(false);
      expect(isVectorObject(123)).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(isVectorObject({ x: NaN })).toBe(true); // typeof NaN === 'number'
      expect(isVectorObject({ x: Infinity })).toBe(true);
      expect(isVectorObject({ x: -Infinity })).toBe(true);
      expect(isVectorObject({ x: 0, extra: "property" })).toBe(true);
    });
  });

  describe("round trip conversions", () => {
    it("should handle Vector2 round trip", () => {
      const arr: Vector2Array = [1.5, 2.5];
      const obj = arrayToVector2(arr);
      const result = vector2ToArray(obj);
      expect(result).toEqual(arr);
    });

    it("should handle Vector3 round trip", () => {
      const arr: Vector3Array = [1.5, 2.5, 3.5];
      const obj = arrayToVector3(arr);
      const result = vector3ToArray(obj);
      expect(result).toEqual(arr);
    });

    it("should handle Vector4 round trip", () => {
      const arr: Vector4Array = [1.5, 2.5, 3.5, 4.5];
      const obj = arrayToVector4(arr);
      const result = vector4ToArray(obj);
      expect(result).toEqual(arr);
    });
  });

  describe("special numeric values", () => {
    it("should handle special values in arrayToVector functions", () => {
      expect(arrayToVector2([Infinity, -Infinity])).toEqual({
        x: Infinity,
        y: -Infinity,
      });
      expect(arrayToVector3([NaN, NaN, NaN])).toEqual({
        x: NaN,
        y: NaN,
        z: NaN,
      });
      expect(arrayToVector4([0, -0, Infinity, -Infinity])).toEqual({
        x: 0,
        y: -0,
        z: Infinity,
        w: -Infinity,
      });
    });

    it("should handle special values in vectorToArray functions", () => {
      expect(vector2ToArray({ x: Infinity, y: -Infinity })).toEqual([
        Infinity,
        -Infinity,
      ]);
      expect(vector3ToArray({ x: NaN, y: NaN, z: NaN })).toEqual([
        NaN,
        NaN,
        NaN,
      ]);
      expect(
        vector4ToArray({ x: 0, y: -0, z: Infinity, w: -Infinity }),
      ).toEqual([0, -0, Infinity, -Infinity]);
    });
  });
});
