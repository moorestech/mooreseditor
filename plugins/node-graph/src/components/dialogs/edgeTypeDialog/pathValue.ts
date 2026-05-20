function toPathKey(segment: string, current: unknown): string | number {
  if (Array.isArray(current) && /^\d+$/.test(segment)) {
    return Number(segment);
  }
  return segment;
}

export function getValueAtPath(root: unknown, path: string[]): unknown {
  let current = root;
  for (const segment of path) {
    if (current === null || current === undefined) return undefined;
    const key = toPathKey(segment, current);
    current = (current as Record<string, unknown>)[key as string];
  }
  return current;
}

export function setValueAtPath(
  root: Record<string, unknown>,
  path: string[],
  value: unknown,
): Record<string, unknown> {
  if (path.length === 0) {
    if (value && typeof value === "object") {
      return value as Record<string, unknown>;
    }
    return root;
  }

  const [head, ...rest] = path;

  const update = (current: unknown, remaining: string[]): unknown => {
    if (remaining.length === 0) return value;

    const [segment, ...next] = remaining;
    if (Array.isArray(current)) {
      const index = Number(segment);
      if (Number.isNaN(index)) return current;
      const cloned = [...current];
      cloned[index] = update(cloned[index], next);
      return cloned;
    }

    const source =
      current && typeof current === "object"
        ? (current as Record<string, unknown>)
        : {};
    return {
      ...source,
      [segment]: update(source[segment], next),
    };
  };

  const source = root && typeof root === "object" ? root : {};
  return {
    ...source,
    [head]: update(source[head], rest),
  };
}
