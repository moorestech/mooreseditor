import { saveProjectFiles } from "./projectPersistence";

import type { Column } from "../hooks/useJson";

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
  projectDir: string | null;
  masterDir: string | null;
  onSuccess: () => void;
}

/**
 * Editor の master カラム群を永続化する。
 *
 * ノードグラフ等プラグイン専用ファイルの保存は Phase 3 以降プラグイン側
 * （`PluginView.save()` → `HostAPI.saveProject`）が担うため、ここでは
 * master カラムのみを扱う。
 */
export async function saveProjectData({
  columns,
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

    // Dev mode: also write files via dev server for E2E verification
    try {
      for (const column of columns) {
        await writeViaDevServer(
          `master/${column.title}.json`,
          JSON.stringify(column.data, null, 2),
        );
      }
    } catch {
      // Dev server API not available — ignore
    }

    onSuccess();
    return;
  }

  try {
    await saveProjectFiles({ columns, projectDir, masterDir });
    onSuccess();
  } catch (error) {
    console.error("保存中にエラー:", error);
  }
}
