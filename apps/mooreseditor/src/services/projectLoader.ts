/**
 * Project loading service.
 *
 * Opens a project directory, reads config, and discovers schemas.
 * Production: Tauri FS + dialog. Fallback: sample project data.
 */

import YAML from "yaml";

import {
  readText,
  listDir,
  joinPath,
  resolvePath,
  addToScope,
  openDirectoryDialog,
} from "./fileSystem";
import { getSampleSchemaList, getSampleSchema } from "./devFileSystem";

export interface ProjectConfig {
  projectDir: string;
  schemaDir: string;
  masterDir: string;
  menuToFileMap: Record<string, string>;
}

/**
 * Open a directory picker and load the project configuration.
 * Returns null if cancelled or if loading fails.
 */
export async function openProject(): Promise<ProjectConfig | null> {
  try {
    const openedDir = await openDirectoryDialog();
    if (!openedDir) return null;

    return await loadProjectFromDir(openedDir);
  } catch {
    // Tauri dialog not available — fall back to sample project
    return await loadSampleProject();
  }
}

/**
 * Load project configuration from a given directory.
 */
export async function loadProjectFromDir(
  projectDir: string,
): Promise<ProjectConfig> {
  // Add opened directory to Tauri FS scope
  await addToScope(projectDir);

  // Read mooreseditor.config.yml
  const configPath = await joinPath(projectDir, "mooreseditor.config.yml");
  const configContents = await readText(configPath);
  const configData = parseYaml(configContents);

  const schemaPath = configData?.schemaPath;
  if (!configData || typeof schemaPath !== "string") {
    throw new Error("Invalid or missing schemaPath in mooreseditor.config.yml");
  }

  const schemaDir = await resolvePath(projectDir, schemaPath);
  await addToScope(schemaDir);

  const masterPath =
    typeof configData.masterPath === "string"
      ? configData.masterPath
      : "master";
  const masterDir = await resolvePath(projectDir, masterPath);
  await addToScope(masterDir);

  // Discover schema files
  const files = await listDir(schemaDir);
  const menuToFileMap: Record<string, string> = {};

  for (const file of files) {
    if (file.name.endsWith(".yml")) {
      const name = file.name.replace(".yml", "");
      menuToFileMap[name] = await joinPath(schemaDir, file.name);
    }
  }

  if (Object.keys(menuToFileMap).length === 0) {
    throw new Error("No YAML files found in the schemaPath.");
  }

  return { projectDir, schemaDir, masterDir, menuToFileMap };
}

/**
 * Load sample project data for dev environment.
 */
export async function loadSampleProject(): Promise<ProjectConfig> {
  const schemaFiles = getSampleSchemaList();
  const menuToFileMap: Record<string, string> = {};

  for (const schemaName of schemaFiles) {
    try {
      const schemaContent = await getSampleSchema(schemaName);
      const schemaData = parseYaml(schemaContent);
      const id = schemaData?.id;
      if (typeof id === "string") {
        menuToFileMap[id] = id;
      }
    } catch {
      // Sample schema not available — skip
    }
  }

  return {
    projectDir: "SampleProject",
    schemaDir: "SampleProject/schema",
    masterDir: "SampleProject/master",
    menuToFileMap,
  };
}

function parseYaml(yamlText: string): Record<string, unknown> | null {
  try {
    return YAML.parse(yamlText) as Record<string, unknown>;
  } catch {
    return null;
  }
}
