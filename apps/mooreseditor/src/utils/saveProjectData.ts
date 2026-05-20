import { invoke } from "@tauri-apps/api/core";
import * as path from "@tauri-apps/api/path";
import { exists, mkdir, writeTextFile } from "@tauri-apps/plugin-fs";

import type { Column } from "../hooks/useJson";

/**
 * `.mooreseditor/nodeGraph.v1.json` として保存される任意の追加ファイル本体。
 *
 * かつてはノードグラフプラグインの `NodeGraphFile` 型を直接 import していたが、
 * Phase 3 でノードグラフはランタイムプラグイン化され、その保存はプラグイン側
 * （`PluginView.save()` → `HostAPI.saveProject`）が担うようになった。
 * アプリ本体はプラグイン成果物への build-time 依存を持たないため、ここでは
 * JSON シリアライズ可能な不透明値として扱う。現状 Editor の保存経路からは
 * 渡されないが、後方互換のためパラメータは温存する。
 */
type ExtraGraphData = Record<string, unknown>;

async function writeViaDevServer(
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

interface SaveProjectDataParams {
  columns: Column[];
  nodeGraphData?: ExtraGraphData | null;
  projectDir: string | null;
  masterDir: string | null;
  onSuccess: () => void;
}

export async function saveProjectData({
  columns,
  nodeGraphData,
  projectDir,
  masterDir,
  onSuccess,
}: SaveProjectDataParams): Promise<void> {
  if (!columns.length || !projectDir) {
    console.error("保存に必要な情報が不足しています");
    return;
  }

  if (projectDir === "SampleProject") {
    console.log("サンプルプロジェクトのため、保存はスキップされました");
    columns.forEach((column) => {
      console.log(
        `${column.title}:`,
        JSON.stringify({ data: column.data }, null, 2),
      );
    });
    if (nodeGraphData) {
      console.log("nodeGraph:", JSON.stringify(nodeGraphData, null, 2));
    }

    // Dev mode: also write files via dev server for E2E verification
    try {
      for (const column of columns) {
        await writeViaDevServer(
          `master/${column.title}.json`,
          JSON.stringify(column.data, null, 2),
        );
      }
      if (nodeGraphData) {
        await writeViaDevServer(
          ".mooreseditor/nodeGraph.v1.json",
          JSON.stringify(nodeGraphData, null, 2),
        );
        console.log("nodeGraph saved via dev server");
      }
    } catch {
      // Dev server API not available — ignore
    }

    onSuccess();
    return;
  }

  const errors: string[] = [];

  for (const column of columns) {
    try {
      if (!masterDir) {
        errors.push(`${column.title}.json: Master directory is not set.`);
        continue;
      }

      const jsonFilePath = await path.join(masterDir, `${column.title}.json`);
      await writeTextFile(jsonFilePath, JSON.stringify(column.data, null, 2));
      console.log(`データが保存されました: ${jsonFilePath}`);
    } catch (error) {
      errors.push(`${column.title}.json: ${error}`);
    }
  }

  if (nodeGraphData) {
    try {
      const mooreseditorDir = await path.join(projectDir, ".mooreseditor");

      // Dotfiles (directories starting with '.') are not matched by the parent
      // directory's glob pattern in Tauri FS scope. Explicitly add .mooreseditor
      // to the allowed scope before creating/writing.
      try {
        await invoke("add_project_to_scope", {
          projectPath: mooreseditorDir,
        });
      } catch {
        // Scope addition failed — likely in dev/browser environment
      }

      const isDirExists = await exists(mooreseditorDir);
      if (!isDirExists) {
        await mkdir(mooreseditorDir, { recursive: true });
      }

      const nodeGraphPath = await path.join(
        mooreseditorDir,
        "nodeGraph.v1.json",
      );
      await writeTextFile(
        nodeGraphPath,
        JSON.stringify(nodeGraphData, null, 2),
      );
      console.log(`nodeGraphが保存されました: ${nodeGraphPath}`);
    } catch (error) {
      errors.push(`nodeGraph: ${error}`);
    }
  }

  if (errors.length === 0) {
    onSuccess();
    return;
  }

  console.error("保存中にエラー:", errors);
}
