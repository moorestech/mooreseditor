import type { JsonValue } from "../domain/data/types";

/**
 * Dev environment: fetch file content from Vite dev server.
 */
async function fetchFileContent(path: string): Promise<string> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`);
  }
  return response.text();
}

/**
 * Dev environment: load a sample JSON file by name.
 */
export async function getSampleJson(name: string): Promise<JsonValue> {
  const content = await fetchFileContent(`/src/sample/master/${name}.json`);
  return JSON.parse(content) as JsonValue;
}

/**
 * Dev environment: load a sample YAML schema file by name.
 */
export async function getSampleSchema(name: string): Promise<string> {
  return await fetchFileContent(`/src/sample/schema/${name}.yml`);
}

/**
 * Dev environment: list of sample main schema file names.
 */
export function getSampleSchemaList(): string[] {
  return [
    "blocks",
    "challenges",
    "characters",
    "craftRecipes",
    "fluids",
    "items",
    "machineRecipes",
    "mapObjects",
    "modMeta",
    "research",
  ];
}

/**
 * Dev environment: list of sample ref schema file names.
 */
export function getSampleRefSchemaList(): string[] {
  return [
    "blockConnectInfo",
    "gameAction",
    "fluidInventoryConnects",
    "gearConnects",
    "inventoryConnects",
    "mapObjectMineSettings",
    "mineSettings",
  ];
}

/**
 * Dev environment: combined map of all schema paths (main + ref).
 */
export function getAllSampleSchemaMap(): Map<string, string> {
  const schemaMap = new Map<string, string>();

  for (const schema of getSampleSchemaList()) {
    schemaMap.set(schema, schema);
  }

  for (const schema of getSampleRefSchemaList()) {
    schemaMap.set(`ref/${schema}`, schema);
  }

  return schemaMap;
}

/**
 * Dev environment: write file content via Vite dev server API.
 */
export async function writeViaDevServer(
  filePath: string,
  content: string,
): Promise<void> {
  const res = await fetch("/api/dev-fs/write", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: filePath, content }),
  });
  if (!res.ok) {
    throw new Error(`Dev FS write failed: ${res.status}`);
  }
}
