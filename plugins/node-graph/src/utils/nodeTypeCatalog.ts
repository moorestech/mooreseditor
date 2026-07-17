// マスタ参照ノード型のカタログ。UI各所の重複定義をここに一元化
// Catalog of master-backed node types; single source for all UI menus
export type MasterNodeType = "item" | "block" | "train" | "research";

export interface NodeTypeCatalogEntry {
  label: string;
  type: MasterNodeType;
  schemaId: string;
}

export const ENTITY_NODE_TYPES: ReadonlyArray<NodeTypeCatalogEntry> = [
  { label: "Item", type: "item", schemaId: "items" },
  { label: "Block", type: "block", schemaId: "blocks" },
  { label: "Train Car", type: "train", schemaId: "train" },
];

export const RESEARCH_NODE_TYPES: ReadonlyArray<NodeTypeCatalogEntry> = [
  { label: "Research", type: "research", schemaId: "research" },
];

export const MASTER_NODE_TYPE_SECTIONS: ReadonlyArray<NodeTypeCatalogEntry> = [
  ...ENTITY_NODE_TYPES,
  ...RESEARCH_NODE_TYPES,
];

// 配置済みレコードをメニューから除外する対象（全マスタ参照型）
// Types deduplicated against already-placed nodes (all master-backed types)
export const FILTERABLE_TYPES: ReadonlySet<string> = new Set(
  MASTER_NODE_TYPE_SECTIONS.map((entry) => entry.type),
);
