import { findSchemaIdForNodeType } from "../../../utils/nodeTypeSchema";

import type { NodeSchemaRef } from "./types";
import type { SchemaMeta } from "../../../utils/schemaMeta";
import type { Node as ReactFlowNode } from "@xyflow/react";

export function getNodeSchemaRef(
  node: ReactFlowNode | null,
  schemaMetas: Map<string, SchemaMeta>,
): NodeSchemaRef {
  if (!node) return { schemaId: null, guid: null };

  const data = node.data as Record<string, unknown>;
  const guid = typeof data.masterGuid === "string" ? data.masterGuid : null;
  if (!guid || !node.type) return { schemaId: null, guid: null };

  return {
    schemaId: findSchemaIdForNodeType(node.type, schemaMetas),
    guid,
  };
}

export function getNodeLabel(node: ReactFlowNode | null): string {
  if (!node) return "(unknown)";

  const data = node.data as Record<string, unknown>;
  if (typeof data.displayName === "string" && data.displayName.length > 0) {
    return data.displayName;
  }

  if (typeof data.masterGuid === "string" && data.masterGuid.length > 0) {
    return data.masterGuid.slice(0, 8);
  }

  return node.id;
}
