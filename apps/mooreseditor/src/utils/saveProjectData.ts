import * as path from "@tauri-apps/api/path";
import { writeTextFile } from "@tauri-apps/plugin-fs";

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

  if (errors.length === 0) {
    onSuccess();
    return;
  }

  console.error("保存中にエラー:", errors);
}
