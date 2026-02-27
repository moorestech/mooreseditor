import type { SchemaMeta } from "./schemaMeta";

/**
 * Resolve schema ID for node type without hardcoding schema structure.
 */
export function findSchemaIdForNodeType(
  nodeType: string,
  schemaMetas: Map<string, SchemaMeta>,
): string | null {
  if (schemaMetas.has(nodeType)) return nodeType;

  const plural = `${nodeType}s`;
  if (schemaMetas.has(plural)) return plural;

  return null;
}
