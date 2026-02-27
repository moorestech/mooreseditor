import YAML from "yaml";

import { RefResolver } from "./refResolver";

import type { SchemaDefinitions } from "./refResolver";
import type { Schema } from "./types";

/**
 * Parse a YAML string into a raw object.
 */
export function parseYaml(yaml: string): unknown {
  return YAML.parse(yaml);
}

/**
 * Parse a YAML string and resolve all $ref references using provided definitions.
 */
export function parseSchemaYaml(
  yaml: string,
  definitions: SchemaDefinitions = {},
): Schema {
  const raw = parseYaml(yaml);
  const resolver = new RefResolver(definitions);
  return resolver.resolve(raw) as Schema;
}

/**
 * Resolve $ref references in a parsed schema object.
 */
export function resolveRefs<T>(schema: T, definitions: SchemaDefinitions): T {
  const resolver = new RefResolver(definitions);
  return resolver.resolve(schema);
}
