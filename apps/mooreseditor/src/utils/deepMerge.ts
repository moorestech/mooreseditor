/**
 * Deep merge two objects recursively
 * @param target - The target object to merge into
 * @param source - The source object to merge from
 * @returns The merged object
 */
export function deepMerge(target: any, source: any): any {
  if (!source || typeof source !== "object") {
    return source;
  }

  if (!target || typeof target !== "object") {
    return cloneValue(source);
  }

  // Both are arrays: preserve target array and recursively merge each element
  if (Array.isArray(target) && Array.isArray(source)) {
    return target.map((item, index) => {
      if (
        index < source.length &&
        item &&
        typeof item === "object" &&
        source[index] &&
        typeof source[index] === "object" &&
        !Array.isArray(item) &&
        !Array.isArray(source[index])
      ) {
        return deepMerge(item, source[index]);
      }
      return item;
    });
  }

  const result: Record<string, any> = { ...target };

  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (Array.isArray(sourceValue)) {
      if (Array.isArray(targetValue)) {
        // Preserve existing array contents so we don't wipe user data
        result[key] = targetValue;
      } else if (targetValue === undefined || targetValue === null) {
        result[key] = cloneValue(sourceValue);
      } else {
        result[key] = cloneValue(sourceValue);
      }
      continue;
    }

    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !(sourceValue instanceof Date) &&
      sourceValue.constructor === Object
    ) {
      result[key] = deepMerge(
        targetValue && typeof targetValue === "object"
          ? targetValue
          : {},
        sourceValue,
      );
      continue;
    }

    if (targetValue === undefined || targetValue === null) {
      result[key] = sourceValue;
    } else {
      result[key] = targetValue;
    }
  }

  return result;
}

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item)) as T;
  }
  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }
  if (value && typeof value === "object") {
    return Object.entries(value).reduce(
      (acc, [key, child]) => {
        acc[key] = cloneValue(child);
        return acc;
      },
      {} as Record<string, any>,
    ) as T;
  }
  return value;
}
